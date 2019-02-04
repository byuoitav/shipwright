package alerts

import (
	"github.com/byuoitav/common/structs"
	"github.com/byuoitav/common/v2/events"
)

var (
	roomAlertsCache map[string][]structs.Alert
)

func init() {
	roomAlertsCache = make(map[string][]structs.Alert)
}

func HandleAlertEvent(event events.Event) {
	/*
			alert := structs.Alert{
				BuildingID: event.TargetDevice.BuildingID,
				RoomID:     event.TargetDevice.RoomID,
				DeviceID:   event.TargetDevice.DeviceID,
			}

		alert.AlertTags = append(alert.AlertTags, event.EventTags...)

		theRoom, err := helpers.GetRoom(alert.RoomID)
		if err != nil {
			log.L.Warnf("the room %s does not exist : %s", alert.RoomID, err.Error())
		}

		alert.RoomTags = append(alert.RoomTags, theRoom.Tags...)

		theDevice, err := helpers.GetDevice(alert.DeviceID)
		if err != nil {
			log.L.Warnf("the device %s does not exist : %s", alert.DeviceID, err.Error())
		}

		alert.DeviceTags = append(alert.DeviceTags, theDevice.Tags...)

		roomAlertsCache[theRoom.ID] = append(roomAlertsCache[theRoom.ID], alert)

		log.L.Info(roomAlertsCache)
	*/
}

/* so it lays out like this:
- receive an event
- determine if that event is an alert, and if so then put it in the map (no dupes)
- if not an alert, determine if the event can fix an existing alert
	- if so then resolve that alert and add it to the resolved map or something.
	- we need to keep track of them before the incident is closed or whatever
- if it can't fix an alert, chuck it because we don't care

That means we need to figure these things out:
- how to determine if an event constitutes as an alert
- some way for the attributes of an event to clue us in to if it can resolve the alert
	- does this step involve running the troubleshooting stuff and then seeing if something comes back first?
	- my initial thought is no, that we will instead have to have some way to know right off the bat if the event that is coming in is one that can fix the alert
*/
