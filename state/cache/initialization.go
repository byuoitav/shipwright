package cache

import (
	"encoding/json"
	"fmt"
	"io/ioutil"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/state/statedefinition"
	"github.com/byuoitav/state-parser/config"
	"github.com/byuoitav/state-parser/elk"
	"github.com/robfig/cron"
)

const maxSize = 10000

const pushCron = "0 0 0 * * *"

//InitializeCaches initializes the caches with data from ELK
func InitializeCaches() {
	Caches = make(map[string]Cache)

	c := config.GetConfig()

	for _, i := range c.Caches {
		log.L.Infof("Initializing cache %v", i.Name)
		var devs []statedefinition.StaticDevice
		var rooms []statedefinition.StaticRoom
		var er *nerr.E
		//depending on storage, data, and cache type depends on what function we call.
		switch i.StorageType {
		case config.Elk:
			//within the elk type
			devs, er = GetElkStaticDevices(i.ELKinfo.DeviceIndex, i.ELKinfo.URL)
			if er != nil {
				log.L.Errorf(er.Addf("Couldn't get information for device cache %v", i.Name).Error())
			}
		default:
		}
		cache := makeCache(devs, rooms, i.CacheType)
		Caches[i.CacheType] = cache
		log.L.Infof("Cache %v initialized with type %v. %v devices and %v rooms", i.Name, i.CacheType, len(devs), len(rooms))
	}
}

//GetElkStaticDevices queries the provided index in ELK and unmarshals the records into a list of static devices
func GetElkStaticDevices(index, url string) ([]statedefinition.StaticDevice, *nerr.E) {
	log.L.Debugf("Getting device information from %v", index)
	query := elk.GenericQuery{
		Size: maxSize,
	}

	b, er := json.Marshal(query)
	if er != nil {
		return []statedefinition.StaticDevice{}, nerr.Translate(er).Addf("Couldn't marshal generic query %v", query)
	}

	resp, err := elk.MakeGenericELKRequest(fmt.Sprintf("%v/%v/_search", url, index), "GET", b)
	if err != nil {
		return []statedefinition.StaticDevice{}, err.Addf("Couldn't retrieve static index %v for cache", index)
	}
	ioutil.WriteFile("/tmp/test", resp, 0777)

	var queryResp elk.StaticDeviceQueryResponse

	er = json.Unmarshal(resp, &queryResp)
	if er != nil {
		return []statedefinition.StaticDevice{}, nerr.Translate(er).Addf("Couldn't unmarshal response from static index %v.", index)
	}

	var toReturn []statedefinition.StaticDevice
	for i := range queryResp.Hits.Wrappers {
		toReturn = append(toReturn, queryResp.Hits.Wrappers[i].Device)
	}

	return toReturn, nil
}

//GetElkStaticRooms retrieves the list of static rooms from the privided elk index - assumes the ELK_DIRECT_ADDRESS env variable.
func GetElkStaticRooms(index string) ([]statedefinition.StaticRoom, *nerr.E) {
	query := elk.GenericQuery{
		Size: maxSize,
	}

	b, er := json.Marshal(query)
	if er != nil {
		return []statedefinition.StaticRoom{}, nerr.Translate(er).Addf("Couldn't marshal generic query %v", query)
	}

	resp, err := elk.MakeELKRequest("GET", fmt.Sprintf("/%v/_search", index), b)
	if err != nil {
		return []statedefinition.StaticRoom{}, err.Addf("Couldn't retrieve static index %v for cache", index)
	}
	log.L.Infof("Getting the info for %v", index)

	var queryResp elk.StaticRoomQueryResponse

	er = json.Unmarshal(resp, &queryResp)
	if er != nil {
		return []statedefinition.StaticRoom{}, nerr.Translate(er).Addf("Couldn't unmarshal response from static index %v.", index)
	}

	var toReturn []statedefinition.StaticRoom
	for i := range queryResp.Hits.Wrappers {
		toReturn = append(toReturn, queryResp.Hits.Wrappers[i].Room)
	}

	return toReturn, nil

}

func makeCache(devices []statedefinition.StaticDevice, rooms []statedefinition.StaticRoom, cacheType string) Cache {

	toReturn := memorycache{
		cacheType: cacheType,
		pushCron:  cron.New(),
	}

	log.L.Infof("adding the cron push")
	//build our push cron
	er := toReturn.pushCron.AddFunc(pushCron, toReturn.PushAllDevices)
	if er != nil {
		log.L.Errorf("Couldn't add the push all devices cron job to the cache")

	}

	//starting the cron job
	toReturn.pushCron.Start()

	//go through and create our maps
	toReturn.deviceCache = make(map[string]DeviceItemManager)

	for i := range devices {
		//check for duplicate
		v, ok := toReturn.deviceCache[devices[i].DeviceID]
		if ok {
			continue
		}

		if len(devices[i].DeviceID) < 1 {
			log.L.Errorf("DeviceID cannot be blank. Device: %+v", devices[i])
			continue
		}

		v, err := GetNewDeviceManagerWithDevice(devices[i])
		if err != nil {
			log.L.Errorf("Cannot create device manager for %v: %v", devices[i].DeviceID, err.Error())
			continue
		}

		respChan := make(chan DeviceTransactionResponse, 1)
		v.WriteRequests <- DeviceTransactionRequest{
			MergeDeviceEdit: true,
			MergeDevice:     devices[i],
			ResponseChan:    respChan,
		}
		val := <-respChan

		if val.Error != nil {
			log.L.Errorf("Error initializing cache for %v: %v.", devices[i].DeviceID, val.Error.Error())
		}
		toReturn.deviceCache[devices[i].DeviceID] = v
	}

	toReturn.roomCache = make(map[string]RoomItemManager)
	for i := range rooms {
		//check for duplicate
		v, ok := toReturn.roomCache[devices[i].DeviceID]
		if ok {
			continue
		}
		v = GetNewRoomManager(rooms[i].RoomID)

		respChan := make(chan RoomTransactionResponse, 1)
		v.WriteRequests <- RoomTransactionRequest{
			MergeRoom:    rooms[i],
			ResponseChan: respChan,
		}
		val := <-respChan

		if val.Error != nil {
			log.L.Errorf("Error initializing cache for %v: %v.", rooms[i].RoomID, val.Error.Error())
		}
		toReturn.roomCache[rooms[i].RoomID] = v
	}

	return &toReturn
}
