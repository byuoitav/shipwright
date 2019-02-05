package store

import (
	"fmt"

	"github.com/byuoitav/common/structs"
)

//GenerateID will give you the generated id back
func GenerateID(a structs.Alert) string {
	return fmt.Sprintf("%v_%v_%v", a.DeviceID, a.Type, a.Category)
}
