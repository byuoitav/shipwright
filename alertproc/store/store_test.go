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

	room := events.BasicRoomInfo{
		BuildingID: "ITB",
		RoomID:     "ITB-1101",
	}

	dev := events.BasicDeviceInfo{
		BasicRoomInfo: room,
		DeviceID:      "ITB-1101-CP1",
	}

	alert := structs.Alert{
		BasicDeviceInfo: dev,
		Type:            structs.Communication,
		Category:        structs.System,
		Severity:        structs.Warning,

		Message:             "I like to send messages 2",
		SystemType:          "pi",
		AlertStartTime:      time.Now(),
		AlertLastUpdateTime: time.Now(),
		Active:              true,
	}

	id, err := AddAlert(alert)
	if err != nil {
		log.L.Errorf("%v", err.Error())
	}

	log.L.Debugf("Alert saved with ID: %v", id)

	time.Sleep(1 * time.Second)
	//update the message log
	alert.Message = "This is a new test"
	id, err = AddAlert(alert)
	if err != nil {
		log.L.Errorf("%v", err.Error())
	}

	time.Sleep(5 * time.Second)
	//let's try to resolve it
	res := structs.ResolutionInfo{
		Code:       "test-code",
		Notes:      "Joe likes to test things\nWe should try and see what kind of crazy notes.",
		ResolvedAt: time.Now(),
	}

	ResolveAlert(id, res)

	time.Sleep(15 * time.Second)
}
