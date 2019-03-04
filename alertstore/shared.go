package alertstore

import (
	"fmt"
	"strings"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	sd "github.com/byuoitav/common/state/statedefinition"
	"github.com/byuoitav/common/structs"
	"github.com/byuoitav/shipwright/state/cache"
	"github.com/fatih/color"
)

const (
	Init      = "init"
	Interface = "interface"
	Cache     = "cache"
)

//GenerateAlertID will give you the generated id back
func GenerateAlertID(a structs.Alert) string {
	return fmt.Sprintf("%v^%v^%v^%v", a.DeviceID, a.Type, a.Category, a.Severity)
}

func GenerateIssueID(a structs.Alert) string {
	return fmt.Sprintf("%v", a.RoomID)
}

//for now it's the same as the roomID
func GetIssueIDFromAlertID(alertID string) string {
	return ParseRoomFromAlertID(alertID)
}

//ParseRoomFromID .
func ParseRoomFromAlertID(alertID string) string {
	parts := strings.Split(alertID, "^")
	if len(parts) < 4 {
		log.L.Errorf("Unkown id format %v", alertID)
		return ""
	}
	devparts := strings.Split("-", parts[0])
	if len(devparts) < 3 {
		log.L.Errorf("Unkown id format %v", alertID)
		return ""
	}

	return fmt.Sprintf("%v-%v", devparts[0], devparts[1])
}

func ParseSeverityFromID(alertID string) string {
	parts := strings.Split(alertID, "^")
	if len(parts) < 4 {
		log.L.Errorf("Unkown id format %v", alertID)
		return ""
	}

	return parts[3]
}

//AddRoomInformationToAlert will check
// A) System Type
// B) Designation
// C) Maintenence Mode
// D) Monitoring
func AddRoomInformationToAlert(a structs.Alert) (structs.Alert, *nerr.E) {

	if a.RoomID == "" {
		//set the room ID based on the device ID
		a.RoomID = structs.GetRoomIDFromDevice(a.DeviceID)
	}
	if a.BuildingID == "" {
		a.BuildingID = strings.Split(a.RoomID, "-")[0]

	}

	//get the room from the Cache
	rm, err := cache.GetCache("default").GetRoomRecord(a.RoomID)
	if err != nil {
		log.L.Errorf("Couldn't get room record for room %v", a.RoomID)
		return a, err.Addf("Couldn't add room info to alert")
	}

	a.SystemType = getSystemType(a.DeviceID, rm)

	if a.SystemType == sd.DMPS {
		log.L.Debugf(color.HiRedString("ADDING DMPS TYPE"))
	}

	if rm.Designation != "" {
		a.RoomTags = structs.AddToTags(a.RoomTags, rm.Designation)
	}
	if rm.MaintenenceMode != nil && *rm.MaintenenceMode {
		a.RoomTags = structs.AddToTags(a.RoomTags, "maintenence-mode")
	}
	if rm.Monitoring != nil && !(*rm.Monitoring) {
		a.RoomTags = structs.AddToTags(a.RoomTags, "not-monitoring")
	}

	return a, nil
}

//will check the system_type
func AddSystemTypeToIssue(issue structs.RoomIssue) (structs.RoomIssue, *nerr.E) {

	systemTypeCount := map[string]int{}
	//check to see if any of the alerts have an alert type
	for i := range issue.Alerts {
		if issue.Alerts[i].SystemType != "unkown" {
			systemTypeCount[issue.Alerts[i].SystemType] = systemTypeCount[issue.Alerts[i].SystemType] + 1
		}
	}

	curleader := "unkown"
	curleaderscore := 0

	for k, v := range systemTypeCount {
		if v > curleaderscore {
			curleader = k
		}
	}
	issue.SystemType = curleader

	if curleader == "unkown" {
		//we check for the issue's room
		rm, err := cache.GetCache("default").GetRoomRecord(issue.RoomID)
		if err != nil {
			log.L.Errorf("Couldn't get room record for room %v", issue.RoomID)
			return issue, err.Addf("Couldn't add room info to issue")
		}
		if len(rm.SystemType) == 0 {
			return issue, nil
		}

		for i := range rm.SystemType {
			if sd.IsDefaultSystemType(rm.SystemType[i]) {
				issue.SystemType = rm.SystemType[i]
				break
			}
		}
	}

	return issue, nil
}

func getSystemType(d string, rm sd.StaticRoom) string {
	if len(rm.SystemType) == 0 {
		return "unknown"
	}

	if len(rm.SystemType) == 1 {
		return rm.SystemType[0]
	}

	def := "unknown"
	for i := range rm.SystemType {
		if sd.IsDefaultSystemType(rm.SystemType[i]) {
			def = rm.SystemType[i]
		}

		//check if the deviceID corresponds to the type provided
		if sd.IsDeviceOfType(d, rm.SystemType[i]) {
			return rm.SystemType[i]
		}
	}

	return def
}
