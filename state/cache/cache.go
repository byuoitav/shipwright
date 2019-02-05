package cache

import (
	"sync"
	"time"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	sd "github.com/byuoitav/common/state/statedefinition"
	"github.com/byuoitav/common/v2/events"
	"github.com/byuoitav/state-parser/config"
	"github.com/byuoitav/state-parser/state/forwarding"
	"github.com/robfig/cron"
)

//Cache is our state cache - it's meant to be a representation of the static indexes
type Cache interface {
	CheckAndStoreDevice(device sd.StaticDevice) (bool, sd.StaticDevice, *nerr.E)
	CheckAndStoreRoom(room sd.StaticRoom) (bool, sd.StaticRoom, *nerr.E)

	GetDeviceRecord(deviceID string) (sd.StaticDevice, *nerr.E)
	GetRoomRecord(roomID string) (sd.StaticRoom, *nerr.E)
	GetAllDeviceRecords() ([]sd.StaticDevice, *nerr.E)
	GetAllRoomRecords() ([]sd.StaticRoom, *nerr.E)

	StoreDeviceEvent(toSave sd.State) (bool, sd.StaticDevice, *nerr.E)
	StoreAndForwardEvent(event events.Event) (bool, *nerr.E)

	GetDeviceManagerList() (int, []string, *nerr.E)
}

//Caches .
var Caches map[string]Cache

func init() {
	pre, _ := log.GetLevel()
	log.SetLevel("info")
	log.L.Infof("Initializing Caches")
	//start
	InitializeCaches()
	log.L.Infof("Caches Initialized.")
	log.SetLevel(pre)
}

//GetCache .
func GetCache(cacheType string) Cache {
	log.L.Debugf("Getting cache %v", cacheType)
	log.L.Debugf("%v", Caches)
	return Caches[cacheType]
}

type memorycache struct {
	devicelock  sync.RWMutex
	deviceCache map[string]DeviceItemManager
	roomlock    sync.RWMutex
	roomCache   map[string]RoomItemManager

	cacheType string

	pushCron *cron.Cron
}

func (c *memorycache) GetDeviceManagerList() (int, []string, *nerr.E) {
	toReturn := []string{}
	for k := range c.deviceCache {
		toReturn = append(toReturn, k)
	}

	return len(c.deviceCache), toReturn, nil
}

func (c *memorycache) StoreAndForwardEvent(v events.Event) (bool, *nerr.E) {
	log.L.Debugf("Event: %+v", v)

	//Forward All
	list := forwarding.GetManagersForType(c.cacheType, config.EVENT, config.ALL)
	for i := range list {
		//log.L.Debugf("Going to event forwarder: %v", list[i])
		list[i].Send(v)
	}

	//if it's an doesn't correspond to core or detail state we don't want to store it.
	if !events.ContainsAnyTags(v, events.CoreState, events.DetailState, events.Heartbeat) {
		return false, nil
	}

	//Cache
	changes, newDev, err := c.StoreDeviceEvent(sd.State{
		ID:    v.TargetDevice.DeviceID,
		Key:   v.Key,
		Time:  v.Timestamp,
		Value: v.Value,
		Tags:  v.EventTags,
	})

	if err != nil {
		return false, err.Addf("Couldn't store and forward device event")
	}

	list = forwarding.GetManagersForType(c.cacheType, config.DEVICE, config.ALL)
	for i := range list {
		list[i].Send(newDev)
	}

	//if there are changes and it's not a heartbeat/hardware event
	if changes && !events.ContainsAnyTags(v, events.Heartbeat, events.HardwareInfo) {

		log.L.Debugf("Event resulted in changes")

		//get the event stuff to forward
		list = forwarding.GetManagersForType(c.cacheType, config.EVENT, config.DELTA)
		for i := range list {
			list[i].Send(v)
		}

		list = forwarding.GetManagersForType(c.cacheType, config.DEVICE, config.DELTA)
		for i := range list {
			list[i].Send(newDev)
		}
	}

	return changes, nil
}

/*
	StoreDeviceEvent takes an event (key value) and stores the value in the field defined as key on a device.S
	Defer use to CheckAndStoreDevice for internal use, as there are significant speed gains.
*/
func (c *memorycache) StoreDeviceEvent(toSave sd.State) (bool, sd.StaticDevice, *nerr.E) {
	//	log.SetLevel("info")
	//	defer log.SetLevel("warn")
	if len(toSave.ID) < 1 {
		return false, sd.StaticDevice{}, nerr.Create("State must include device ID", "invaid-parameter")
	}

	c.devicelock.RLock()
	manager, ok := c.deviceCache[toSave.ID]
	c.devicelock.RUnlock()
	if !ok {
		log.L.Infof("Creating a new device manager for %v", toSave.ID)

		var err *nerr.E
		//we need to create a new manager and set it up
		manager, err = GetNewDeviceManager(toSave.ID)
		if err != nil {
			return false, sd.StaticDevice{}, err.Addf("couldn't store device event")
		}

		c.devicelock.Lock()
		c.deviceCache[toSave.ID] = manager
		c.devicelock.Unlock()
	}

	respChan := make(chan DeviceTransactionResponse, 1)

	//send a request to update
	manager.WriteRequests <- DeviceTransactionRequest{
		EventEdit:    true,
		Event:        toSave,
		ResponseChan: respChan,
	}

	//wait for a response
	resp := <-respChan

	if resp.Error != nil {
		return false, sd.StaticDevice{}, resp.Error.Addf("Couldn't store event %v.", toSave)
	}

	return resp.Changes, resp.NewDevice, nil
}

/*CheckAndStoreDevice takes a device, will check to see if there are deltas compared to the values in the map, and store any changes.

Bool returned denotes if there were any changes. True indicates that there were updates
*/
func (c *memorycache) CheckAndStoreDevice(device sd.StaticDevice) (bool, sd.StaticDevice, *nerr.E) {
	if len(device.DeviceID) == 0 {
		return false, sd.StaticDevice{}, nerr.Create("Static Device must have an ID field to be loaded into the databaset", "invalid-device")
	}

	c.devicelock.RLock()
	manager, ok := c.deviceCache[device.DeviceID]
	c.devicelock.RUnlock()

	if !ok {
		var err *nerr.E
		manager, err = GetNewDeviceManager(device.DeviceID)
		if err != nil {
			return false, device, err.Addf("Couldn't check and store device")
		}

		c.devicelock.Lock()
		c.deviceCache[device.DeviceID] = manager
		c.devicelock.Unlock()
	}

	respChan := make(chan DeviceTransactionResponse, 1)

	//send a request to update
	manager.WriteRequests <- DeviceTransactionRequest{
		MergeDeviceEdit: true,
		MergeDevice:     device,
		ResponseChan:    respChan,
	}

	//wait for a response
	resp := <-respChan

	if resp.Error != nil {
		return false, sd.StaticDevice{}, resp.Error.Addf("Couldn't store device %v.", device)
	}

	if resp.Changes {
		list := forwarding.GetManagersForType(c.cacheType, config.DEVICE, config.DELTA)
		for i := range list {
			list[i].Send(resp.NewDevice)
		}

		list = forwarding.GetManagersForType(c.cacheType, config.DEVICE, config.ALL)
		for i := range list {
			list[i].Send(resp.NewDevice)
		}
	}

	return resp.Changes, resp.NewDevice, nil
}

//GetDeviceRecord returns a device with the corresponding ID, if any is found in the memorycache
func (c *memorycache) GetDeviceRecord(deviceID string) (sd.StaticDevice, *nerr.E) {

	manager, ok := c.deviceCache[deviceID]
	if !ok {
		return sd.StaticDevice{}, nil
	}

	respChan := make(chan sd.StaticDevice, 1)

	manager.ReadRequests <- respChan
	return <-respChan, nil
}

/*CheckAndStoreRoom takes a room, will check to see if there are deltas compared to the values in the map, and store any changes.

Bool returned denotes if there were any changes. True indicates that there were updates
Room returned contains ONLY the deltas.
*/
func (c *memorycache) CheckAndStoreRoom(room sd.StaticRoom) (bool, sd.StaticRoom, *nerr.E) {
	if len(room.RoomID) == 0 {
		return false, sd.StaticRoom{}, nerr.Create("Static room must have a roomID to be compared and stored", "invalid-room")
	}

	manager, ok := c.roomCache[room.RoomID]
	if !ok {
		manager = GetNewRoomManager(room.RoomID)
	}

	respChan := make(chan RoomTransactionResponse, 1)

	//send a request to update
	manager.WriteRequests <- RoomTransactionRequest{
		MergeRoom:    room,
		ResponseChan: respChan,
	}

	//wait for a response
	resp := <-respChan

	if resp.Error != nil {
		return false, sd.StaticRoom{}, resp.Error.Addf("Couldn't store room %v.", room)
	}

	return resp.Changes, resp.NewRoom, nil
}

func (c *memorycache) PushAllDevices() {

	//get all the records
	log.L.Infof("Pushing updates for all devices to DELTA and ALL indexes")

	devs, err := c.GetAllDeviceRecords()
	if err != nil {
		log.L.Errorf(err.Addf("Couldn't push all devices").Error())
		return
	}
	list := forwarding.GetManagersForType(c.cacheType, config.DEVICE, config.DELTA)
	for i := range list {
		for j := range devs {
			er := list[i].Send(devs[j])
			if er != nil {
				log.L.Warnf("Problem sending all update for devices %v. %v", devs[j].DeviceID, er.Error())
			}
		}
	}

	list = forwarding.GetManagersForType(c.cacheType, config.DEVICE, config.ALL)
	for i := range list {
		for j := range devs {
			er := list[i].Send(devs[j])
			if er != nil {
				log.L.Warnf("Problem sending all update for devices %v. %v", devs[j].DeviceID, er.Error())
			}
		}
	}

	log.L.Infof("Done sending update for all devices")
}

//GetRoomRecord returns a room
func (c *memorycache) GetRoomRecord(roomID string) (sd.StaticRoom, *nerr.E) {
	manager, ok := c.roomCache[roomID]
	if !ok {
		return sd.StaticRoom{}, nil
	}

	respChan := make(chan sd.StaticRoom, 1)

	manager.ReadRequests <- respChan
	return <-respChan, nil
}

func (c *memorycache) GetAllDeviceRecords() ([]sd.StaticDevice, *nerr.E) {
	toReturn := []sd.StaticDevice{}

	expected := len(c.deviceCache)
	ReadChannel := make(chan sd.StaticDevice, expected)

	c.devicelock.RLock()
	for _, v := range c.deviceCache {
		v.ReadRequests <- ReadChannel
	}
	c.devicelock.RUnlock()

	timeoutTimer := time.NewTimer(1 * time.Second)

	received := 0
	for {
		select {
		case <-timeoutTimer.C:
			log.L.Infof("ReadAll devices timed out..")
			return toReturn, nil
		case v := <-ReadChannel:
			toReturn = append(toReturn, v)
			received++
			if received >= expected {
				log.L.Debugf("Got all responses from the read all devices")
				return toReturn, nil
			}
		}
	}
}

func (c *memorycache) GetAllRoomRecords() ([]sd.StaticRoom, *nerr.E) {
	toReturn := []sd.StaticRoom{}

	expected := len(c.deviceCache)
	ReadChannel := make(chan sd.StaticRoom, expected)

	c.roomlock.RLock()
	for _, v := range c.roomCache {
		v.ReadRequests <- ReadChannel
	}
	c.roomlock.RUnlock()

	timeoutTimer := time.NewTimer(1 * time.Second)

	received := 0
	for {
		select {
		case <-timeoutTimer.C:
			log.L.Infof("ReadAll rooms timed out..")
			return toReturn, nil
		case v := <-ReadChannel:
			toReturn = append(toReturn, v)
			received++
			if received >= expected {
				log.L.Debugf("Got all responses from the read all rooms")
				return toReturn, nil
			}
		}
	}
}
