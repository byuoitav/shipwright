package store

import (
	"testing"
	"time"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/structs"
	"github.com/byuoitav/common/v2/events"
)

func TestStoreAlert(t *testing.T) {
	log.SetLevel("debug")

	InitializeAlertStore(nil)

	time.Sleep(5 * time.Second)

	alert := structs.Alert{
		events.BasicDeviceInfo: events.BasicDeviceInfo{},
	}
}
