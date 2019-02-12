package alertstore

import (
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

	alerts, err := store.GetAllAlerts()
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

	alerts, err := store.GetAllAlerts()
	if err != nil {
		return toReturn, err.Addf("Couldn't get alerts by incident number.")
	}

	for i := range alerts {
		if alerts[i].IncidentNumber == incidentNumber {
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
 * The Function will also check to see if the batch of alerts contains all non-resolved alerts on a room. If it does not it will create a new incident to be attached to these alerts.
 */
func ResolveAlerts(resInfo ResolutionInfo, alertIDs ...string) *nerr.E {
	store.resolveAlertSet()

}
