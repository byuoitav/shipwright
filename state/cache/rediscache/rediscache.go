package rediscache

import (
	"bytes"
	"encoding/gob"
	"sync"

	"github.com/byuoitav/common/nerr"
	sd "github.com/byuoitav/common/state/statedefinition"
	"github.com/byuoitav/common/v2/events"
	"github.com/byuoitav/shipwright/config"
	"github.com/byuoitav/shipwright/state/cache/shared"
	"github.com/go-redis/redis"
)

type RedisCache struct {
	configuration config.Cache

	devclient  *redis.Client
	roomclient *redis.Client

	devLock *sync.RWMutex
	devmu   map[string]*sync.Mutex

	roomLock *sync.RWMutex
	roommu   map[string]*sync.Mutex
}

func init() {
	gob.Register(sd.StaticDevice)
	gob.Register(sd.StaticRoom)

}

func MakeRedisCache(devices []sd.StaticDevice, rooms []sd.StaticRoom, pushCron, configuration config.Cache) (shared.Cache, *nerr.E) {

	//substitute the password if needed
	pass := config.ReplaceEnv(configuration.RedisInfo.Password)
	addr := config.ReplaceEnv(configuration.RedisInfo.URL)
	if addr == "" {
		addr = "localhost:6379"
	}
	if configuration.RedisInfo.roomDatabase == 0 {
		configuration.RedisInfo.roomDatabase = 1
	}

	toReturn := RedisCache{
		configuration: configuration,
		devmu:         map[string]*sync.Mutex{},
		roommu:        map[string]*sync.Mutex{},
		devLock:       &sync.RWMutex{},
		roomLock:      &sync.RWMutex{},
	}

	toReturn.devclient = redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: pass,
		DB:       configuration.RedisInfo.DevDatabase,
	})

	_, err := toReturn.devclient.Ping().Result()
	if err != nil {
		return toReturn, nerr.Translate(err).Addf("Couldn't communicate with redis server at %v", addr)
	}

	toReturn.roomclient = redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: pass,
		DB:       configuration.RedisInfo.RoomDatabase,
	})

	_, err := toReturn.roomclient.Ping().Result()
	if err != nil {
		return toReturn, nerr.Translate(err).Addf("Couldn't communicate with redis server at %v", addr)
	}

	return toReturn, nil
}

func (rc *RedisCache) CheckAndStoreDevice(device sd.StaticDevice) (bool, sd.StaticDevice, *nerr.E) {
	v := rc.getDeviceMu(device.ID)
	v.Lock()
	defer v.Unlock()

	dev, err := rc.GetDeviceRecord(device.ID)
	if err != nil {
		return false, dev, err.Addf("Couldn't check and store device")
	}

	_, merged, changes, err = sd.CompareDevices(dev, device)
	if err != nil {
		return false, dev, err.Addf("Couldn't check and store device")
	}

	return false, sd.StaticDevice{}, nil

	if changes {
		err := rc.putDevice(merged)
		if err != nil {
			return false, device, err.Addf("Couldn't check and store device")
		}
	}

	return changes, merged, nil
}

func (rc *RedisCache) CheckAndStoreRoom(room sd.StaticRoom) (bool, sd.StaticRoom, *nerr.E) {
	v := rc.getRoomMu(room.RoomID)
	v.Lock()
	defer v.Unlock()

	rm, err := rc.GetRoomRecord(room.RoomID)
	if err != nil {
		return false, dev, err.Addf("Couldn't check and store room")
	}

	_, merged, changes, err = sd.CompareRooms(rm, room)
	if err != nil {
		return false, dev, err.Addf("Couldn't check and store room")
	}

	return false, sd.StaticRoom{}, nil

	if changes {
		err := rc.putRoom(merged)
		if err != nil {
			return false, room, err.Addf("Couldn't check and store room")
		}
	}

	return changes, merged, nil

}

func (rc *RedisCache) GetDeviceRecord(deviceID string) (sd.StaticDevice, *nerr.E) {

	//get and lock the device
	v := rc.getDeviceMu(deviceID)
	v.Lock()
	defer v.Unlock()

	//get the device
	return rc.getDevice()
}

func (rc *RedisCache) GetRoomRecord(roomID string) (sd.StaticRoom, *nerr.E) {
	//get and lock the device
	v := rc.getRoomMu(roomId)
	v.Lock()
	defer v.Unlock()

	//get the device
	return rc.getDevice()
}

func (rc *RedisCache) GetAllDeviceRecords() ([]sd.StaticDevice, *nerr.E) {

	keys, er := rc.getAllDeviceKeys()
	if er != nil {
		return []sd.StaticDevice{}, er.Addf("Couldn't get all device records")
	}

	result, err := client.MGet(keys...).Result()
	if err != nil {
		return []sd.StaticDevice{}, nerr.Translate(err).Addf("Couldn't get all device records")
	}

	var toReturn []sd.StaticDevice

	var tmp sd.StaticDevice

	for i := range result {

		buf := bytes.NewBuffer([]byte(result[i].(string)))
		dec := gob.NewDecoder(buf)

		err = dec.Decode(&tmp)
		if err != nil {
			return []sd.StaticDevice{}, nerr.Translate(err).Addf("Couldn't get all device records")
		}
		toReturn = append(toReturn, tmp)
	}

	return toReturn, nil
}

func (rc *RedisCache) GetAllRoomRecords() ([]sd.StaticRoom, *nerr.E) {
	keys, er := rc.getAllRoomKeys()
	if er != nil {
		return []sd.StaticRoom{}, er.Addf("Couldn't get all device records")
	}

	result, err := client.MGet(keys...).Result()
	if err != nil {
		return []sd.StaticRoom{}, nerr.Translate(err).Addf("Couldn't get all device records")
	}

	var toReturn []sd.StaticRoom

	var tmp sd.StaticRoom

	for i := range result {

		buf := bytes.NewBuffer([]byte(result[i].(string)))
		dec := gob.NewDecoder(buf)

		err = dec.Decode(&tmp)
		if err != nil {
			return []sd.StaticRoom{}, nerr.Translate(err).Addf("Couldn't get all device records")
		}
		toReturn = append(toReturn, tmp)
	}

	return toReturn, nil
}

func (rc *RedisCache) StoreDeviceEvent(toSave sd.State) (bool, sd.StaticDevice, *nerr.E) {
	if len(toSave.ID) < 1 {
		return false, sd.StaticDevice{}, nerr.Create("State must include device ID", "invaid-parameter")
	}

	//get and lock the device
	v := rc.getDeviceMu(toSave.ID)
	v.Lock()
	defer v.Unlock()

	dev, err := rc.getDevice(toSave.ID)
	if err != nil {
		return false, sd.StaticDevice, err.Addf("Couldn't store device event")
	}

	//make our edits
	merged, changes, err = shared.EditDeviceFromEvent(toSave, curDevice)
	if err != nil {
		return false, sd.StaticDevice, err.Addf("Couldn't store device event")
	}
	err := rc.putDevice(merged)

	return changes, merged, err
}

func (rc *RedisCache) StoreAndForwardEvent(event events.Event) (bool, *nerr.E) {
	return shared.ForwardAndStoreEvent(v, rc)
}

func (rc *RedisCache) GetCacheType() string {
	return "redis"
}

func (rc *RedisCache) GetCacheName() string {
	return rc.configuration.Name
}
