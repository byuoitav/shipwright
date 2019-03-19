package handlers

import (
	"testing"
	"time"

	"github.com/byuoitav/common/log"
	schedule "github.com/byuoitav/wso2services/classschedules/registar"
)

func TestClasses(t *testing.T) {
	log.SetLevel("info")
	roomID := "MARB-130"
	now := time.Now()
	end := time.Date(now.Year(), now.Month(), now.Day(), 23, 59, 59, 59, now.Location())

	classes, err := schedule.GetClassScheduleForTimeBlock(roomID, now, end)
	if err != nil {
		log.L.Infof("failed: %s", err.Error())
	}

	for _, class := range classes {
		log.L.Infof("%s-%s: %s - %s", class.DeptName, class.CatalogNumber, class.StartTime, class.EndTime)
	}

	// filter out classes that aren't today

	log.L.Infof("classes: %+v", classes)
}
