package store

import (
	"fmt"
	"time"

	"github.com/byuoitav/common/structs"
)

//GenerateID will give you the generated id back
func GenerateID(a structs.Alert) string {
	return fmt.Sprintf("%v_%v_%v_%v", a.DeviceID, a.Type, a.Category, a.AlertStartTime.Format(time.RFC3339))
}
