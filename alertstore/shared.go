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

//GenerateID will give you the generated id back
func GenerateID(a structs.Alert) string {
	return fmt.Sprintf("%v^%v^%v^%v", a.DeviceID, a.Type, a.Category, a.Severity)
}

//ParseRoomFromID .
func ParseRoomFromID(alertID string) string {
	parts := strings.Split(alertID, "^")
	if len(parts) < 4 {
		log.L.Errorf("Unkown id format %v", alertID)
		return ""
	}
	devparts := strings.Split("-", parts[0])

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

	//get the room from the Cache
	rm, err := cache.GetCache("default").GetRoomRecord(a.RoomID)
	if err != nil {
		return a, err.Addf("Couldn't add room info to alert")
	}

	a.SystemType = getSystemType(a.DeviceID, rm)

	if a.SystemType == sd.DMPS {
		log.L.Info(color.HiRedString("ADDING DMPS TYPE"))
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
