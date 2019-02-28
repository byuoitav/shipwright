package helpers

import (
	"fmt"

	"github.com/byuoitav/shipwright/alertstore"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	sd "github.com/byuoitav/common/state/statedefinition"
	"github.com/byuoitav/common/structs"
	cache "github.com/byuoitav/shipwright/state/cache"
)

// RoomCombinedState -
type RoomCombinedState struct {
	RoomID           string              `json:"roomID"`
	StaticRoom       sd.StaticRoom       `json:"static-room"`
	RoomIssues       []structs.RoomIssue `json:"room-issues"`
	AllAlerts        []structs.Alert     `json:"all-alerts"`
	ActiveAlertCount int                 `json:"active-alert-count"`
	TotalAlertCount  int                 `json:"total-alert-count"`
	StaticDevices    []sd.StaticDevice   `json:"static-devices"`
}

// GetRoomCombinedStateRecord returns a a single toom state record
func GetRoomCombinedStateRecord(roomID string) (RoomCombinedState, *nerr.E) {
	allRooms, err := GetAllRoomCombinedStateRecords()
	var retValue RoomCombinedState
	if err != nil {
		return retValue, err
	}

	for _, room := range allRooms {
		if room.RoomID == roomID {
			return room, nil
		}
	}

	return retValue, nerr.Create("No Room record found for "+roomID, "error")
}

// GetAllRoomCombinedStateRecords returns a list of combined room state records
func GetAllRoomCombinedStateRecords() ([]RoomCombinedState, *nerr.E) {
	var retValue []RoomCombinedState

	//first, get all the static rooms
	sRooms, err := GetAllStaticRoomRecords()
	if err != nil {
		msg := fmt.Sprintf("failed to get all static room records : %s", err.Error())
		log.L.Errorf("%s %s", "GetAllRoomCombinedStateRecords", msg)
		return retValue, err
	}

	//second, get all the static device records
	sDevices, err := GetAllStaticDeviceRecords()
	if err != nil {
		msg := fmt.Sprintf("failed to get all static device records : %s", err.Error())
		log.L.Errorf("%s %s", "GetAllRoomCombinedStateRecords", msg)
		return retValue, err
	}

	//third, get all of the room issues
	roomIssues, err := alertstore.GetAllIssues()
	if err != nil {
		msg := fmt.Sprintf("failed to get all room issues : %s", err.Error())
		log.L.Errorf("%s %s", "GetAllRoomCombinedStateRecords", msg)
		return retValue, err
	}

	//now do the correlation and the counting
	correlation := make(map[string]RoomCombinedState)

	//static rooms
	for _, sRoom := range sRooms {
		roomCombinedState, ok := correlation[sRoom.RoomID]

		if !ok {
			roomCombinedState = RoomCombinedState{}
			roomCombinedState.RoomID = sRoom.RoomID
		}

		roomCombinedState.StaticRoom = sRoom
		correlation[sRoom.RoomID] = roomCombinedState
	}

	//static devices

	for _, sDevice := range sDevices {
		roomCombinedState, ok := correlation[sDevice.Room]

		if !ok {
			roomCombinedState = RoomCombinedState{}
			roomCombinedState.RoomID = sDevice.Room
		}

		roomCombinedState.StaticDevices = append(roomCombinedState.StaticDevices, sDevice)
		correlation[sDevice.Room] = roomCombinedState
	}

	//room issues
	for _, roomIssue := range roomIssues {
		roomCombinedState, ok := correlation[roomIssue.RoomID]

		if !ok {
			roomCombinedState = RoomCombinedState{}
			roomCombinedState.RoomID = roomIssue.RoomID
		}

		roomCombinedState.RoomIssues = append(roomCombinedState.RoomIssues, roomIssue)

		//add to the count
		roomCombinedState.ActiveAlertCount += roomIssue.AlertActiveCount
		roomCombinedState.TotalAlertCount += roomIssue.AlertCount

		correlation[roomIssue.RoomID] = roomCombinedState
	}

	//convert to array
	for _, value := range correlation {
		retValue = append(retValue, value)
	}

	//return
	return retValue, nil
}

// GetAllStaticDeviceRecords returns a list of all the static device records
func GetAllStaticDeviceRecords() ([]sd.StaticDevice, *nerr.E) {
	defaultDevices, err := cache.GetCache("default").GetAllDeviceRecords()
	if err != nil {
		return []sd.StaticDevice{}, err
	}

	// legacyDevices, err := cache.GetCache("legacy").GetAllDeviceRecords()
	// if err != nil {
	// 	return []sd.StaticDevice{}, err
	// }

	// defaultDevices = append(defaultDevices, legacyDevices...)

	return defaultDevices, nil
}

// GetAllStaticRoomRecords returns a list of all the static room records
func GetAllStaticRoomRecords() ([]sd.StaticRoom, *nerr.E) {
	defaultRooms, err := cache.GetCache("default").GetAllRoomRecords()
	if err != nil {
		return []sd.StaticRoom{}, err
	}

	// legacyRooms, err := cache.GetCache("Legacy").GetAllRoomRecords()
	// if err != nil {
	// 	return []sd.StaticRoom{}, err
	// }

	// defaultRooms = append(defaultRooms, legacyRooms...)

	return defaultRooms, nil
}
