package alertstore

import (
	"crypto/md5"
	"fmt"

	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/structs"
)

//AddAlert takes an alert and stores it in the store. It will return the AlertID.
func AddAlert(a structs.Alert) (string, *nerr.E) {
	a.Source = Interface
	return store.putAlert(a)
}

//GetAllAlerts get all alerts currently active in the store
func GetAllAlerts() ([]structs.Alert, *nerr.E) {
	return store.getAllAlerts()

}

//GetAllAlertsByRoom get all alerts currently active in the store
func GetAllAlertsByRoom(roomID string) ([]structs.Alert, *nerr.E) {
	toReturn := []structs.Alert{}

	alerts, err := store.getAllAlerts()
	if err != nil {
		return toReturn, err.Addf("Couldn't get alerts by room.")
	}

	for i := range alerts {
		if alerts[i].RoomID == roomID {
			toReturn = append(toReturn, alerts[i])
		}
	}

	return toReturn, nil
}

//GetAllAlertsByIncident get all alerts currently active in the store
func GetAllAlertsByIncident(incidentNumber string) ([]structs.Alert, *nerr.E) {
	toReturn := []structs.Alert{}

	alerts, err := store.getAllAlerts()
	if err != nil {
		return toReturn, err.Addf("Couldn't get alerts by incident number.")
	}

	for i := range alerts {
		if alerts[i].IncidentID == incidentNumber {
			toReturn = append(toReturn, alerts[i])
		}
	}

	return toReturn, nil

}

//GetAlert Gets a specific alert by AlertID
func GetAlert(AlertID string) (structs.Alert, *nerr.E) {
	return store.getAlert(AlertID)
}

/* ResolveAlert will close the alert id's provided with the resolution info provided.
 *
 */
func ResolveAlert(resInfo structs.ResolutionInfo, alertID string) *nerr.E {
	return store.resolveAlertSet(resInfo, alertID)
}

//Generates a 'Hash that is used to create new values'
func ResolveAlertSet(resInfo structs.ResolutionInfo, alertIDs ...string) *nerr.E {

	room := ""
	sev := ""
	for i := range alertIDs {
		//check to see if they're all in the same room, if not, we don't let it happen.

		tmpRoom := ParseRoomFromID(alertIDs[i])
		if room == "" {
			room = tmpRoom
		} else if room != tmpRoom {
			return nerr.Create("cannot batch resolve alerts not in the same room", "invalid-batch")
		}

		tmpSev := ParseSeverityFromID(alertIDs[i])
		if sev == "" {
			sev = tmpSev
		} else if sev != tmpSev {
			return nerr.Create("cannot batch resolve with separate severities", "invalid-batch")
		}

	}

	if len(alertIDs) < 1 {
		return nerr.Create("Must include an alertID", "invalid-input")
	}

	//generate the hash
	if len(alertIDs) > 1 {
		str := ""
		for i := range alertIDs {
			str += alertIDs[i]
		}
		hash := md5.Sum([]byte(str))
		resInfo.ResolutionHash = fmt.Sprintf("%x %v", hash, len(alertIDs))
	}

	//resolve
	return store.resolveAlertSet(resInfo, alertIDs...)
}
