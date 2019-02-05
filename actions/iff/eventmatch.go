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
	} `json:"target-device"`
	TargetDevice struct {
		BuildingID string `json:"buildingID,omitempty"`
		RoomID     string `json:"roomID,omitempty"`
		DeviceID   string `json:"deviceID,omitempty"`
	} `json:"affected-room"`

	Regex struct {
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
	m.init.Do(m.buildRegex)

	if m.Count == 0 {
		return true
	}

	event, ok := actionctx.GetEvent(ctx)
	if !ok {
		return false
	}

	if m.Regex.GeneratingSystem != nil {
		reg := m.Regex.GeneratingSystem.Copy()
		if !reg.MatchString(event.GeneratingSystem) {
			return false
		}
	}

	if m.Regex.Timestamp != nil {
		reg := m.Regex.Timestamp.Copy()
		if !reg.MatchString(event.Timestamp.String()) {
			return false
		}
	}

	if len(m.Regex.EventTags) > 0 {
		matched := 0

		for _, regex := range m.Regex.EventTags {
			reg := regex.Copy()

			for _, tag := range event.EventTags {
				if reg.MatchString(tag) {
					matched++
					break
				}
			}
		}

		if matched != len(m.Regex.EventTags) {
			return false
		}
	}

	if m.Regex.Key != nil {
		reg := m.Regex.Key.Copy()
		if !reg.MatchString(event.Key) {
			return false
		}
	}

	if m.Regex.Value != nil {
		reg := m.Regex.Value.Copy()
		if !reg.MatchString(event.Value) {
			return false
		}
	}

	if m.Regex.User != nil {
		reg := m.Regex.User.Copy()
		if !reg.MatchString(event.User) {
			return false
		}
	}

	if m.Regex.Data != nil {
		reg := m.Regex.Data.Copy()
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

	if m.Regex.TargetDevice.BuildingID != nil {
		reg := m.Regex.TargetDevice.BuildingID.Copy()
		if !reg.MatchString(event.TargetDevice.BuildingID) {
			return false
		}
	}

	if m.Regex.TargetDevice.RoomID != nil {
		reg := m.Regex.TargetDevice.RoomID.Copy()
		if !reg.MatchString(event.TargetDevice.RoomID) {
			return false
		}
	}

	if m.Regex.TargetDevice.DeviceID != nil {
		reg := m.Regex.TargetDevice.DeviceID.Copy()
		if !reg.MatchString(event.TargetDevice.DeviceID) {
			return false
		}
	}

	if m.Regex.AffectedRoom.BuildingID != nil {
		reg := m.Regex.AffectedRoom.BuildingID.Copy()
		if !reg.MatchString(event.AffectedRoom.BuildingID) {
			return false
		}
	}

	if m.Regex.AffectedRoom.RoomID != nil {
		reg := m.Regex.AffectedRoom.RoomID.Copy()
		if !reg.MatchString(event.AffectedRoom.RoomID) {
			return false
		}
	}

	return true
}

func (m *EventMatch) buildRegex() {
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
}
