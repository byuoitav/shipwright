package store

import "github.com/byuoitav/common/structs"

//AddAlert takes an alert and stores it in the store. It will return the AlertID.
func AddAlert(a structs.Alert) string {

	return ""
}

//GetAllAlerts get all alerts currently active in the store
func GetAllAlerts() []structs.Alert {

	return []structs.Alert{}
}

//GetAlert Gets a specific alert by AlertID
func GetAlert(AlertID string) structs.Alert {

	return structs.Alert{}
}

//GetAlertBySeverity Gets all of the active alerts by severity
func GetAlertBySeverity(Severity structs.AlertSeverity) []structs.Alert {

	return []structs.Alert{}
}
