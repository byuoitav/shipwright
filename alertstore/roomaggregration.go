package alertstore

import (
	"time"

	"github.com/byuoitav/common/structs"
	"github.com/byuoitav/common/state/statedefinition"
	"github.com/byuoitav/shipwright/state/cache"
	"github.com/byuoitav/common/log"

)

func CalculateAggregateInfo(roomID string) {

	var aggregateRoom statedefinition.StaticRoom
	aggregateRoom.AlertingDeviceCount = new(int)
	*aggregateRoom.AlertingDeviceCount = 0
	//For each severity option
	for _, severity := range structs.AlertSeverities{
		roomIssue, err := GetRoomIssue(roomID + "-" + severity)
		if err != nil {
			log.L.Errorf("Couldn't get the other room issue: %v", err)
			return
		}

		//For each device in the issue's device list
		for _, issueDevice := range roomIssue.AlertDevices{
			found := false

			//For each device in the aggregate room's device list
			for _, d := range aggregateRoom.AlertingDevices{
				if issueDevice == d{
					found = true
					break
				}
			}

			//Add if the issue's device is not in the room's device list
			if !found{
				aggregateRoom.AlertingDevices = append(aggregateRoom.AlertingDevices, issueDevice)	
				(*aggregateRoom.AlertingDeviceCount)++
			}
		}
	}
	
	//Set the update times for the merge
	aggregateRoom.UpdateTimes = map[string]time.Time{
		"alerting-devices" : time.Now(),
		"alerting-device-count" : time.Now(),
	}

	//Send that to the cache
	cache.GetCache("default").CheckAndStoreRoom(aggregateRoom)



}
