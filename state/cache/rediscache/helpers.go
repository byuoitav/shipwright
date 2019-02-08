package rediscache

import (
	"bytes"
	"encoding/gob"
	"sync"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	sd "github.com/byuoitav/common/state/statedefinition"
	"github.com/byuoitav/shipwright/state/cache/shared"
	"github.com/go-redis/redis"
)

func (rc *RedisCache) getAllDeviceKeys() ([]string, *nerr.E) {
	return getAllKeys(rc.devclient)
}
func (rc *RedisCache) getAllRoomKeys() ([]string, *nerr.E) {
	return getAllKeys(rc.roomclient)
}

func getAllKeys(client *redis.Client) ([]string, *nerr.E) {

	var newkeys []string
	var keys []string
	var cursor uint64
	var err error

	for {
		newkeys, cursor, err = client.Scan(cursor, "*", 50).Result()
		if err != nil {
			log.L.Errorf("Couldn't get all device keys: %v", err.Error())
			return keys, nerr.Translate(err).Addf("Couldn't get all device keys")
		}
		keys = append(keys, newkeys...)

		if cursor == 0 {
			break
		}
	}

	return keys, nil
}

func (rc *RedisCache) getDeviceMu(id string) *sync.Mutex {

	rc.devLock.RLock()

	//check to see if someone else is already editing the same device, if so, we wait for it
	v, ok := rc.devmu[id]
	rc.devLock.RUnlock()

	//First access to the device
	if !ok {
		//we need to add it
		rc.devLock.Lock()
		v = &sync.Mutex{}
		//make sure no one else added it while we were waiting
		v, ok = rc.devmu[id]
		if !ok {
			v = &sync.Mutex{}
			rc.devmu[id] = v
		}
		rc.devLock.Unlock()
	}
	return v
}
func (rc *RedisCache) getRoomMu(id string) *sync.Mutex {

	rc.roomLock.RLock()

	//check to see if someone else is already editing the same device, if so, we wait for it
	v, ok := rc.roommu[id]
	rc.roomLock.RUnlock()

	//First access to the device
	if !ok {
		//we need to add it
		rc.roomLock.Lock()
		v = &sync.Mutex{}
		//make sure no one else added it while we were waiting
		v, ok = rc.roommu[id]
		if !ok {
			v = &sync.Mutex{}

			rc.roommu[id] = v
		}
		rc.roomLock.Unlock()
	}
	return v
}

//assumes that we've already locked the device
func (rc *RedisCache) getDevice(id string) (sd.StaticDevice, *nerr.E) {

	var curDevice sd.StaticDevice
	by, err := rc.devclient.Get(id).Bytes()
	if err == redis.Nil {
		//device doesn't exist - we can create a new one
		curDevice, err = shared.GetNewDevice(id)
		if err != nil {
			log.L.Errorf("Error accessing redis cache: %v", err.Error())
			return sd.StaticDevice{}, nerr.Translate(err).Addf("Couldn't access redis cache")
		}
	} else if err != nil {
		log.L.Errorf("Error accessing redis cache: %v", err.Error())
		return sd.StaticDevice{}, nerr.Translate(err).Addf("Couldn't access redis cache")
	} else {
		buf := bytes.NewBuffer(by)
		dec := gob.NewDecoder(buf)

		err = dec.Decode(&curDevice)
		if err != nil {
			log.L.Errorf("Error decoding device from cache record: %v", err.Error())
			return sd.StaticDevice{}, nerr.Translate(err).Addf("Bad data in redis cluster: %s: %s", err.Error(), by)
		}
	}

	return curDevice, nil
}

//assumes that we've already locked the room
func (rc *RedisCache) getRoom(id string) (sd.StaticRoom, *nerr.E) {

	var curRoom sd.StaticRoom
	by, err := roomclient.Get(id).Bytes()
	if err == redis.Nil {
		//device doesn't exist - we can create a new one
		curRoom = shared.GetNewRoom()
	} else if err != nil {
		log.L.Errorf("Error accessing redis cache: %v", err.Error())
		return sd.StaticRoom{}, nerr.Translate(err).Addf("Couldn't access redis cache")
	} else {
		buf := bytes.NewBuffer(by)
		dec := gob.NewDecoder(buf)

		err = dec.Decode(&curRoom)
		if err != nil {
			log.L.Errorf("Error decoding device from cache record: %v", err.Error())
			return sd.StaticRoom{}, nerr.Translate(err).Addf("Bad data in redis cluster: %s: %s", err.Error(), by)
		}
	}

	return curRoom, nil
}

//assumes that we've already locked the device
func (rc *RedisCache) putDevice(dev sd.StaticDevice) *nerr.E {

	var device bytes.Buffer
	enc := gob.NewEncoder(&device)
	err := enc.Encode(dev)
	if err != nil {
		log.L.Errorf("%v", err.Error())
		return nerr.Translate(err).Addf("Couldn't encode device: %v", err.Error())
	}

	err = devclient.Put(id, device.Bytes(), 0).Err()
	if err != nil {
		return nerr.Translate(err).Addf("Couldn't access redis cache")
	}
}

//assumes that we've already locked the room
func (rc *RedisCache) putRoom(rm sd.StaticRoom) *nerr.E {

	var room bytes.Buffer
	enc := gob.NewEncoder(&room)
	err := enc.Encode(rm)
	if err != nil {
		log.L.Errorf("%v", err.Error())
		return nerr.Translate(err).Addf("Couldn't encode room: %v", err.Error())
	}

	err = rmclient.Put(id, rm.Bytes(), 0).Err()
	if err != nil {
		return nerr.Translate(err).Addf("Couldn't access redis cache")
	}
}
