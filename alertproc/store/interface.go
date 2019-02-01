package store

import (
	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/structs"
)

//AddAlert takes an alert and stores it in the store. It will return the AlertID.
func AddAlert(a structs.Alert) (string, *nerr.E) {

	return store.putAlert(a)
}

//GetAllAlerts get all alerts currently active in the store
func GetAllAlerts() ([]structs.Alert, *nerr.E) {

	return []structs.Alert{}, nil
}

//GetAlert Gets a specific alert by AlertID
func GetAlert(AlertID string) (structs.Alert, *nerr.E) {

	return store.GetAlert(AlertID)
}

//GetAlertBySeverity Gets all of the active alerts by severity
func GetAlertBySeverity(Severity structs.AlertSeverity) ([]structs.Alert, *nerr.E) {

	return []structs.Alert{}, nil
}

func DeactivateAlert(AlertID string) {

}

func ResolveAlert(AlertID string, resInfo ResolutionInfo) {

}
