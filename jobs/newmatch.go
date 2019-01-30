package jobs

import (
	"regexp"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/shipwright/config"
)

// NewMatchConfig contains the logic for building/matching regex for events that come in

func (r *runner) buildNewMatchRegex() *config.NewMatchConfig {
	m := r.Trigger.NewMatch
	m.Count = 0

	// build the regex for each field
	if len(m.GeneratingSystem) > 0 {
		m.Regex.GeneratingSystem = regexp.MustCompile(m.GeneratingSystem)
		m.Count++
	}

	if len(m.Timestamp) > 0 {
		m.Regex.Timestamp = regexp.MustCompile(m.Timestamp)
		m.Count++
	}

	if len(m.Key) > 0 {
		m.Regex.Key = regexp.MustCompile(m.Key)
		m.Count++
	}

	if len(m.Value) > 0 {
		m.Regex.Value = regexp.MustCompile(m.Value)
		m.Count++
	}

	if len(m.User) > 0 {
		m.Regex.User = regexp.MustCompile(m.User)
		m.Count++
	}

	if len(m.Data) > 0 {
		m.Regex.Data = regexp.MustCompile(m.Data)
		m.Count++
	}

	if len(m.TargetDevice.BuildingID) > 0 {
		m.Regex.TargetDevice.BuildingID = regexp.MustCompile(m.TargetDevice.BuildingID)
		m.Count++
	}

	if len(m.TargetDevice.RoomID) > 0 {
		m.Regex.TargetDevice.RoomID = regexp.MustCompile(m.TargetDevice.RoomID)
		m.Count++
	}

	if len(m.TargetDevice.DeviceID) > 0 {
		m.Regex.TargetDevice.DeviceID = regexp.MustCompile(m.TargetDevice.DeviceID)
		m.Count++
	}

	if len(m.AffectedRoom.BuildingID) > 0 {
		m.Regex.AffectedRoom.BuildingID = regexp.MustCompile(m.AffectedRoom.BuildingID)
		m.Count++
	}

	if len(m.AffectedRoom.RoomID) > 0 {
		m.Regex.AffectedRoom.RoomID = regexp.MustCompile(m.AffectedRoom.RoomID)
		m.Count++
	}

	for _, tag := range m.EventTags {
		m.Regex.EventTags = append(m.Regex.EventTags, regexp.MustCompile(tag))
		m.Count++
	}

	log.L.Infof("Count: %v", m)

	return m
}
