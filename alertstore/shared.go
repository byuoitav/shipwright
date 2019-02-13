package alertstore

import (
	"fmt"
	"strings"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/structs"
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
