package helpers

import (
	"github.com/byuoitav/common/nerr"
	sd "github.com/byuoitav/common/state/statedefinition"
	cache "github.com/byuoitav/shipwright/state/cache"
)

// GetAllStaticDeviceRecords returns a list of all the static device records
func GetAllStaticDeviceRecords() ([]sd.StaticDevice, *nerr.E) {
	defaultDevices, err := cache.GetCache("default").GetAllDeviceRecords()
	if err != nil {
		return []sd.StaticDevice{}, err
	}

	legacyDevices, err := cache.GetCache("legacy").GetAllDeviceRecords()
	if err != nil {
		return []sd.StaticDevice{}, err
	}

	defaultDevices = append(defaultDevices, legacyDevices...)

	return defaultDevices, nil
}

// GetAllStaticRoomRecords returns a list of all the static room records
func GetAllStaticRoomRecords() ([]sd.StaticRoom, *nerr.E) {
	defaultRooms, err := cache.GetCache("Default").GetAllRoomRecords()
	if err != nil {
		return []sd.StaticRoom{}, err
	}

	legacyRooms, err := cache.GetCache("Legacy").GetAllRoomRecords()
	if err != nil {
		return []sd.StaticRoom{}, err
	}

	defaultRooms = append(defaultRooms, legacyRooms...)

	return defaultRooms, nil
}
