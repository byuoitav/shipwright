package iff

import (
	"context"
	"encoding/json"
	"regexp"
	"sync"

	"github.com/byuoitav/shipwright/actions/actionctx"
)

// EventMatch .
type EventMatch struct {
	Count int
	init  sync.Once

	GeneratingSystem string   `json:"generating-system"`
	Timestamp        string   `json:"timestamp"`
	EventTags        []string `json:"event-tags"`
	Key              string   `json:"key"`
	Value            string   `json:"value"`
	User             string   `json:"user"`
	Data             string   `json:"data,omitempty"`
	AffectedRoom     struct {
		BuildingID string `json:"buildingID,omitempty"`
		RoomID     string `json:"roomID,omitempty"`
	} `json:"affected-room"`
	TargetDevice struct {
		BuildingID string `json:"buildingID,omitempty"`
		RoomID     string `json:"roomID,omitempty"`
		DeviceID   string `json:"deviceID,omitempty"`
	} `json:"target-device"`

	regex struct {
		GeneratingSystem *regexp.Regexp
		Timestamp        *regexp.Regexp
		EventTags        []*regexp.Regexp
		Key              *regexp.Regexp
		Value            *regexp.Regexp
		User             *regexp.Regexp
		Data             *regexp.Regexp
		AffectedRoom     struct {
			BuildingID *regexp.Regexp
			RoomID     *regexp.Regexp
		}
		TargetDevice struct {
			BuildingID *regexp.Regexp
			RoomID     *regexp.Regexp
			DeviceID   *regexp.Regexp
		}
	}
}

//DoesEventMatch .
func (m *EventMatch) DoesEventMatch(ctx context.Context) bool {
	m.init.Do(m.buildregex)

	if m.Count == 0 {
		return true
	}

	event, ok := actionctx.GetEvent(ctx)
	if !ok {
		return false
	}

	if m.regex.GeneratingSystem != nil {
		reg := m.regex.GeneratingSystem.Copy()
		if !reg.MatchString(event.GeneratingSystem) {
			return false
		}
	}

	if m.regex.Timestamp != nil {
		reg := m.regex.Timestamp.Copy()
		if !reg.MatchString(event.Timestamp.String()) {
			return false
		}
	}

	if len(m.regex.EventTags) > 0 {
		matched := 0

		for _, regex := range m.regex.EventTags {
			reg := regex.Copy()

			for _, tag := range event.EventTags {
				if reg.MatchString(tag) {
					matched++
					break
				}
			}
		}

		if matched != len(m.regex.EventTags) {
			return false
		}
	}

	if m.regex.Key != nil {
		reg := m.regex.Key.Copy()
		if !reg.MatchString(event.Key) {
			return false
		}
	}

	if m.regex.Value != nil {
		reg := m.regex.Value.Copy()
		if !reg.MatchString(event.Value) {
			return false
		}
	}

	if m.regex.User != nil {
		reg := m.regex.User.Copy()
		if !reg.MatchString(event.User) {
			return false
		}
	}

	if m.regex.Data != nil {
		reg := m.regex.Data.Copy()
		// convert event.Data to a json string
		bytes, err := json.Marshal(event.Data)
		if err != nil {
			return false
		}

		// or should i do fmt.Sprintf?
		if !reg.MatchString(string(bytes[:])) {
			return false
		}
	}

	if m.regex.TargetDevice.BuildingID != nil {
		reg := m.regex.TargetDevice.BuildingID.Copy()
		if !reg.MatchString(event.TargetDevice.BuildingID) {
			return false
		}
	}

	if m.regex.TargetDevice.RoomID != nil {
		reg := m.regex.TargetDevice.RoomID.Copy()
		if !reg.MatchString(event.TargetDevice.RoomID) {
			return false
		}
	}

	if m.regex.TargetDevice.DeviceID != nil {
		reg := m.regex.TargetDevice.DeviceID.Copy()
		if !reg.MatchString(event.TargetDevice.DeviceID) {
			return false
		}
	}

	if m.regex.AffectedRoom.BuildingID != nil {
		reg := m.regex.AffectedRoom.BuildingID.Copy()
		if !reg.MatchString(event.AffectedRoom.BuildingID) {
			return false
		}
	}

	if m.regex.AffectedRoom.RoomID != nil {
		reg := m.regex.AffectedRoom.RoomID.Copy()
		if !reg.MatchString(event.AffectedRoom.RoomID) {
			return false
		}
	}

	return true
}

func (m *EventMatch) buildregex() {
	m.Count = 0

	// build the regex for each field
	if len(m.GeneratingSystem) > 0 {
		m.regex.GeneratingSystem = regexp.MustCompile(m.GeneratingSystem)
		m.Count++
	}

	if len(m.Timestamp) > 0 {
		m.regex.Timestamp = regexp.MustCompile(m.Timestamp)
		m.Count++
	}

	if len(m.Key) > 0 {
		m.regex.Key = regexp.MustCompile(m.Key)
		m.Count++
	}

	if len(m.Value) > 0 {
		m.regex.Value = regexp.MustCompile(m.Value)
		m.Count++
	}

	if len(m.User) > 0 {
		m.regex.User = regexp.MustCompile(m.User)
		m.Count++
	}

	if len(m.Data) > 0 {
		m.regex.Data = regexp.MustCompile(m.Data)
		m.Count++
	}

	if len(m.TargetDevice.BuildingID) > 0 {
		m.regex.TargetDevice.BuildingID = regexp.MustCompile(m.TargetDevice.BuildingID)
		m.Count++
	}

	if len(m.TargetDevice.RoomID) > 0 {
		m.regex.TargetDevice.RoomID = regexp.MustCompile(m.TargetDevice.RoomID)
		m.Count++
	}

	if len(m.TargetDevice.DeviceID) > 0 {
		m.regex.TargetDevice.DeviceID = regexp.MustCompile(m.TargetDevice.DeviceID)
		m.Count++
	}

	if len(m.AffectedRoom.BuildingID) > 0 {
		m.regex.AffectedRoom.BuildingID = regexp.MustCompile(m.AffectedRoom.BuildingID)
		m.Count++
	}

	if len(m.AffectedRoom.RoomID) > 0 {
		m.regex.AffectedRoom.RoomID = regexp.MustCompile(m.AffectedRoom.RoomID)
		m.Count++
	}

	for _, tag := range m.EventTags {
		m.regex.EventTags = append(m.regex.EventTags, regexp.MustCompile(tag))
		m.Count++
	}
}
