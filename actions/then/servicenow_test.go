package then

import (
	"testing"
	"time"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/structs"
)

func TestServiceNow(t *testing.T) {
	log.SetLevel("debug")

	alert := structs.Alert{
		BasicDeviceInfo: dev,
		Type:            structs.Communication,
		Category:        structs.System,
		Severity:        structs.Critical,

		Message:             "I like to send messages 2",
		SystemType:          "pi",
		AlertStartTime:      time.Now(),
		AlertLastUpdateTime: time.Now(),
		Active:              true,
	}

	id, err =: CreateIncidentRepair(alert)
	if err != nil {
		log.L.Errorf("%v", err.Error())
	} else{
		log.L.Debugf("Incident/Repair saved with ID: %v", id)
	}
	

	time.Sleep(1 * time.Second)
	//update the message log
	alert.Message = "This is a new test"
	alert.IncidentID = id
	id, err = CreateIncidentRepair(alert)	
	if err != nil {
		log.L.Errorf("%v", err.Error())
	}
	log.L.Debugf("Incident/Repair with ID: %v was updated", id)

	time.Sleep(5 * time.Second)
	//let's try to resolve it
	resolved := structs.ResolutionInfo{
		Code:       "test-code",
		Notes:      "Matt is testing things\nWe should try and see what kind of crazy notes.",
		ResolvedAt: time.Now(),
	}
	alert.ResolutionInfo = resolved
	id, err = CreateIncidentRepair(alert)	
	if err != nil {
		log.L.Errorf("%v", err.Error())
	}
	log.L.Debugf("Incident/Repair with ID: %v was closed", id)

	//	ResolveAlert(id, res)

	time.Sleep(15 * time.Second)
}
