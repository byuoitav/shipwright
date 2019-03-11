package alertstore

// var (
// 	initonce          sync.Once
// 	roomAggsInChannel chan structs.RoomIssue
// )

// func calculateAggregateInfo(roomIssue structs.RoomIssue) {
// 	initonce.Do(func() {
// 		roomAggsInChannel = make(chan structs.RoomIssue, 200)
// 		go runStaticRoomAggregator(roomAggsInChannel)
// 	})

// 	roomAggsInChannel <- roomIssue
// }

// //thread to take a room issue off of a channel and process it
// func runStaticRoomAggregator(InChannel chan structs.RoomIssue) {
// 	for {
// 		roomIssue := <-InChannel
// 		var aggregateRoom statedefinition.StaticRoom
// 		aggregateRoom.AlertingDeviceCount = new(int)
// 		*aggregateRoom.AlertingDeviceCount = 0

// 		//For each device in the issue's device list
// 		for _, issueDevice := range roomIssue.AlertDevices {
// 			found := false

// 			//For each device in the aggregate room's device list
// 			for _, d := range aggregateRoom.AlertingDevices {
// 				if issueDevice == d {
// 					found = true
// 					break
// 				}
// 			}

// 			//Add if the issue's device is not in the room's device list
// 			if !found {
// 				aggregateRoom.AlertingDevices = append(aggregateRoom.AlertingDevices, issueDevice)
// 				(*aggregateRoom.AlertingDeviceCount)++
// 			}
// 		}

// 		//Set the update times for the merge
// 		aggregateRoom.UpdateTimes = map[string]time.Time{
// 			"alerting-devices":      time.Now(),
// 			"alerting-device-count": time.Now(),
// 		}

// 		//Send that to the cache
// 		go cache.GetCache("default").CheckAndStoreRoom(aggregateRoom)
// 	}

// }
