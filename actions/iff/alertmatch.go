package iff

import (
	"context"
	"encoding/json"
	"fmt"
	"regexp"
	"sync"

	"github.com/byuoitav/shipwright/actions/actionctx"
)

// AlertMatch .
type AlertMatch struct {
	count int
	init  sync.Once

	AlertID    string `json:"id"`
	BuildingID string `json:"buildingID"`
	RoomID     string `json:"roomID"`
	DeviceID   string `json:"deviceID"`

	Type     string `json:"type"`
	Category string `json:"category"`
	Severity string `json:"severity"`

	Message    string   `json:"message"`
	MessageLog []string `json:"message-log"`
	Data       string   `json:"data,omitempty"`
	SystemType string   `json:"system-type"`
	Requester  string   `json:"requester"`

	AlertStartTime      string `json:"start-time"`
	AlertEndTime        string `json:"end-time"`
	AlertLastUpdateTime string `json:"update-time"`

	Active *bool `json:"active"`

	AlertTags  []string `json:"alert-tags"`
	RoomTags   []string `json:"room-tags"`
	DeviceTags []string `json:"device-tags"`

	Regex struct {
		AlertID    *regexp.Regexp
		BuildingID *regexp.Regexp
		RoomID     *regexp.Regexp
		DeviceID   *regexp.Regexp

		Type     *regexp.Regexp
		Category *regexp.Regexp
		Severity *regexp.Regexp

		Message    *regexp.Regexp
		MessageLog []*regexp.Regexp
		Data       *regexp.Regexp
		SystemType *regexp.Regexp
		Requester  *regexp.Regexp

		AlertStartTime      *regexp.Regexp
		AlertEndTime        *regexp.Regexp
		AlertLastUpdateTime *regexp.Regexp

		AlertTags  []*regexp.Regexp
		RoomTags   []*regexp.Regexp
		DeviceTags []*regexp.Regexp
	}
}

// DoesAlertMatch .
func (m *AlertMatch) DoesAlertMatch(ctx context.Context) bool {
	m.init.Do(m.buildRegex)

	if m.count == 0 {
		return true
	}

	alert, ok := actionctx.GetAlert(ctx)
	if !ok {
		return false
	}

	// do the bools first, they are the fastest
	if m.Active != nil {
		if alert.Active != *m.Active {
			return false
		}
	}

	// then the rest of the stuff
	if m.Regex.AlertID != nil {
		reg := m.Regex.AlertID.Copy()
		if !reg.MatchString(alert.AlertID) {
			return false
		}
	}

	if m.Regex.DeviceID != nil {
		reg := m.Regex.DeviceID.Copy()
		if !reg.MatchString(alert.DeviceID) {
			return false
		}
	}

	if m.Regex.RoomID != nil {
		reg := m.Regex.RoomID.Copy()
		if !reg.MatchString(alert.RoomID) {
			return false
		}
	}

	if m.Regex.BuildingID != nil {
		reg := m.Regex.BuildingID.Copy()
		if !reg.MatchString(alert.BuildingID) {
			return false
		}
	}

	if m.Regex.Type != nil {
		reg := m.Regex.Type.Copy()
		if !reg.MatchString(string(alert.Type)) {
			return false
		}
	}

	if m.Regex.Category != nil {
		reg := m.Regex.Category.Copy()
		if !reg.MatchString(string(alert.Category)) {
			return false
		}
	}

	if m.Regex.Severity != nil {
		reg := m.Regex.Severity.Copy()
		if !reg.MatchString(fmt.Sprintf("%v", alert.Severity)) {
			return false
		}
	}

	if m.Regex.Message != nil {
		reg := m.Regex.Message.Copy()
		if !reg.MatchString(alert.Message) {
			return false
		}
	}

	if len(m.Regex.MessageLog) > 0 {
		matched := 0

		for _, regex := range m.Regex.MessageLog {
			reg := regex.Copy()

			for _, msg := range alert.MessageLog {
				if reg.MatchString(msg) {
					matched++
					break
				}
			}
		}

		if matched != len(m.Regex.MessageLog) {
			return false
		}
	}

	if m.Regex.Data != nil {
		reg := m.Regex.Data.Copy()
		// convert event.Data to a json string
		bytes, err := json.Marshal(alert.Data)
		if err != nil {
			return false
		}

		// or should i do fmt.Sprintf?
		if !reg.MatchString(string(bytes[:])) {
			return false
		}
	}

	if m.Regex.SystemType != nil {
		reg := m.Regex.SystemType.Copy()
		if !reg.MatchString(alert.SystemType) {
			return false
		}
	}

	if m.Regex.Requester != nil {
		reg := m.Regex.Requester.Copy()
		if !reg.MatchString(alert.Requester) {
			return false
		}
	}

	if m.Regex.AlertStartTime != nil {
		reg := m.Regex.AlertStartTime.Copy()
		if !reg.MatchString(alert.AlertStartTime.String()) {
			return false
		}
	}

	if m.Regex.AlertEndTime != nil {
		reg := m.Regex.AlertEndTime.Copy()
		if !reg.MatchString(alert.AlertEndTime.String()) {
			return false
		}
	}

	if m.Regex.AlertLastUpdateTime != nil {
		reg := m.Regex.AlertLastUpdateTime.Copy()
		if !reg.MatchString(alert.AlertLastUpdateTime.String()) {
			return false
		}
	}

	if len(m.Regex.AlertTags) > 0 {
		matched := 0

		for _, regex := range m.Regex.AlertTags {
			reg := regex.Copy()

			for _, tag := range alert.AlertTags {
				if reg.MatchString(tag) {
					matched++
					break
				}
			}
		}

		if matched != len(m.Regex.AlertTags) {
			return false
		}
	}

	if len(m.Regex.RoomTags) > 0 {
		matched := 0

		for _, regex := range m.Regex.RoomTags {
			reg := regex.Copy()

			for _, tag := range alert.RoomTags {
				if reg.MatchString(tag) {
					matched++
					break
				}
			}
		}

		if matched != len(m.Regex.RoomTags) {
			return false
		}
	}

	if len(m.Regex.DeviceTags) > 0 {
		matched := 0

		for _, regex := range m.Regex.DeviceTags {
			reg := regex.Copy()

			for _, tag := range alert.DeviceTags {
				if reg.MatchString(tag) {
					matched++
					break
				}
			}
		}

		if matched != len(m.Regex.DeviceTags) {
			return false
		}
	}

	return true
}

func (m *AlertMatch) buildRegex() {
	m.count = 0

	if len(m.AlertID) > 0 {
		m.Regex.AlertID = regexp.MustCompile(m.AlertID)
		m.count++
	}

	if len(m.BuildingID) > 0 {
		m.Regex.BuildingID = regexp.MustCompile(m.BuildingID)
		m.count++
	}

	if len(m.RoomID) > 0 {
		m.Regex.RoomID = regexp.MustCompile(m.RoomID)
		m.count++
	}

	if len(m.DeviceID) > 0 {
		m.Regex.DeviceID = regexp.MustCompile(m.DeviceID)
		m.count++
	}

	if len(m.Type) > 0 {
		m.Regex.Type = regexp.MustCompile(m.Type)
		m.count++
	}

	if len(m.Category) > 0 {
		m.Regex.Category = regexp.MustCompile(m.Category)
		m.count++
	}

	if len(m.Severity) > 0 {
		m.Regex.Severity = regexp.MustCompile(m.Severity)
		m.count++
	}

	if len(m.Message) > 0 {
		m.Regex.Message = regexp.MustCompile(m.Message)
		m.count++
	}

	for _, msg := range m.MessageLog {
		m.Regex.MessageLog = append(m.Regex.MessageLog, regexp.MustCompile(msg))
		m.count++
	}

	if len(m.Data) > 0 {
		m.Regex.Data = regexp.MustCompile(m.Data)
		m.count++
	}

	if len(m.SystemType) > 0 {
		m.Regex.SystemType = regexp.MustCompile(m.SystemType)
		m.count++
	}

	if len(m.Requester) > 0 {
		m.Regex.Requester = regexp.MustCompile(m.Requester)
		m.count++
	}

	if len(m.AlertStartTime) > 0 {
		m.Regex.AlertStartTime = regexp.MustCompile(m.AlertStartTime)
		m.count++
	}

	if len(m.AlertEndTime) > 0 {
		m.Regex.AlertEndTime = regexp.MustCompile(m.AlertEndTime)
		m.count++
	}

	if len(m.AlertLastUpdateTime) > 0 {
		m.Regex.AlertLastUpdateTime = regexp.MustCompile(m.AlertLastUpdateTime)
		m.count++
	}

	for _, tag := range m.AlertTags {
		m.Regex.AlertTags = append(m.Regex.AlertTags, regexp.MustCompile(tag))
		m.count++
	}

	for _, tag := range m.RoomTags {
		m.Regex.RoomTags = append(m.Regex.RoomTags, regexp.MustCompile(tag))
		m.count++
	}

	for _, tag := range m.DeviceTags {
		m.Regex.DeviceTags = append(m.Regex.DeviceTags, regexp.MustCompile(tag))
		m.count++
	}
}
