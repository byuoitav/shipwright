package iff

import (
	"context"
	"encoding/json"
	"fmt"
	"regexp"
	"sync"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/shipwright/actions/actionctx"
)

// AlertMatch .
type AlertMatch struct {
	count int
	init  sync.Once

	AlertID    string `json:"id,omitempty"`
	BuildingID string `json:"buildingID,omitempty"`
	RoomID     string `json:"roomID,omitempty"`
	DeviceID   string `json:"deviceID,omitempty"`

	Type     string `json:"type,omitempty"`
	Category string `json:"category,omitempty"`
	Severity string `json:"severity,omitempty"`

	Message    string   `json:"message,omitempty"`
	MessageLog []string `json:"message-log,omitempty"`
	Data       string   `json:"data,omitempty,omitempty"`
	SystemType string   `json:"system-type,omitempty"`
	Requester  string   `json:"requester,omitempty"`

	AlertStartTime      string `json:"start-time,omitempty"`
	AlertEndTime        string `json:"end-time,omitempty"`
	AlertLastUpdateTime string `json:"update-time,omitempty"`

	Active *bool `json:"active,omitempty"`

	AlertTags  []string `json:"alert-tags,omitempty"`
	RoomTags   []string `json:"room-tags,omitempty"`
	DeviceTags []string `json:"device-tags,omitempty"`

	regex struct {
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
	m.init.Do(m.buildregex)

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

		log.SetLevel("info")
		log.L.Infof("UNIQUE Passed: *m.Active = '%v'. alert.Active = '%v'", *m.Active, alert.Active)
	}

	// then the rest of the stuff
	if m.regex.AlertID != nil {
		reg := m.regex.AlertID.Copy()
		if !reg.MatchString(alert.AlertID) {
			return false
		}
	}

	if m.regex.DeviceID != nil {
		reg := m.regex.DeviceID.Copy()
		if !reg.MatchString(alert.DeviceID) {
			return false
		}
	}

	if m.regex.RoomID != nil {
		reg := m.regex.RoomID.Copy()
		if !reg.MatchString(alert.RoomID) {
			return false
		}
	}

	if m.regex.BuildingID != nil {
		reg := m.regex.BuildingID.Copy()
		if !reg.MatchString(alert.BuildingID) {
			return false
		}
	}

	if m.regex.Type != nil {
		reg := m.regex.Type.Copy()
		if !reg.MatchString(string(alert.Type)) {
			return false
		}
	}

	if m.regex.Category != nil {
		reg := m.regex.Category.Copy()
		if !reg.MatchString(string(alert.Category)) {
			return false
		}
	}

	if m.regex.Severity != nil {
		reg := m.regex.Severity.Copy()
		if !reg.MatchString(fmt.Sprintf("%v", alert.Severity)) {
			return false
		}
	}

	if m.regex.Message != nil {
		reg := m.regex.Message.Copy()
		if !reg.MatchString(alert.Message) {
			return false
		}
	}

	if len(m.regex.MessageLog) > 0 {
		matched := 0

		for _, regex := range m.regex.MessageLog {
			reg := regex.Copy()

			for _, msg := range alert.MessageLog {
				if reg.MatchString(msg) {
					matched++
					break
				}
			}
		}

		if matched != len(m.regex.MessageLog) {
			return false
		}
	}

	if m.regex.Data != nil {
		reg := m.regex.Data.Copy()
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

	if m.regex.SystemType != nil {
		reg := m.regex.SystemType.Copy()
		if !reg.MatchString(alert.SystemType) {
			return false
		}
	}

	if m.regex.Requester != nil {
		reg := m.regex.Requester.Copy()
		if !reg.MatchString(alert.Requester) {
			return false
		}
	}

	if m.regex.AlertStartTime != nil {
		reg := m.regex.AlertStartTime.Copy()
		if !reg.MatchString(alert.AlertStartTime.String()) {
			return false
		}
	}

	if m.regex.AlertEndTime != nil {
		reg := m.regex.AlertEndTime.Copy()
		if !reg.MatchString(alert.AlertEndTime.String()) {
			return false
		}
	}

	if m.regex.AlertLastUpdateTime != nil {
		reg := m.regex.AlertLastUpdateTime.Copy()
		if !reg.MatchString(alert.AlertLastUpdateTime.String()) {
			return false
		}
	}

	if len(m.regex.AlertTags) > 0 {
		matched := 0

		for _, regex := range m.regex.AlertTags {
			reg := regex.Copy()

			for _, tag := range alert.AlertTags {
				if reg.MatchString(tag) {
					matched++
					break
				}
			}
		}

		if matched != len(m.regex.AlertTags) {
			return false
		}
	}

	if len(m.regex.RoomTags) > 0 {
		matched := 0

		for _, regex := range m.regex.RoomTags {
			reg := regex.Copy()

			for _, tag := range alert.RoomTags {
				if reg.MatchString(tag) {
					matched++
					break
				}
			}
		}

		if matched != len(m.regex.RoomTags) {
			return false
		}
	}

	if len(m.regex.DeviceTags) > 0 {
		matched := 0

		for _, regex := range m.regex.DeviceTags {
			reg := regex.Copy()

			for _, tag := range alert.DeviceTags {
				if reg.MatchString(tag) {
					matched++
					break
				}
			}
		}

		if matched != len(m.regex.DeviceTags) {
			return false
		}
	}

	return true
}

func (m *AlertMatch) buildregex() {
	m.count = 0

	if len(m.AlertID) > 0 {
		m.regex.AlertID = regexp.MustCompile(m.AlertID)
		m.count++
	}

	if len(m.BuildingID) > 0 {
		m.regex.BuildingID = regexp.MustCompile(m.BuildingID)
		m.count++
	}

	if len(m.RoomID) > 0 {
		m.regex.RoomID = regexp.MustCompile(m.RoomID)
		m.count++
	}

	if len(m.DeviceID) > 0 {
		m.regex.DeviceID = regexp.MustCompile(m.DeviceID)
		m.count++
	}

	if len(m.Type) > 0 {
		m.regex.Type = regexp.MustCompile(m.Type)
		m.count++
	}

	if len(m.Category) > 0 {
		m.regex.Category = regexp.MustCompile(m.Category)
		m.count++
	}

	if len(m.Severity) > 0 {
		m.regex.Severity = regexp.MustCompile(m.Severity)
		m.count++
	}

	if len(m.Message) > 0 {
		m.regex.Message = regexp.MustCompile(m.Message)
		m.count++
	}

	for _, msg := range m.MessageLog {
		m.regex.MessageLog = append(m.regex.MessageLog, regexp.MustCompile(msg))
		m.count++
	}

	if len(m.Data) > 0 {
		m.regex.Data = regexp.MustCompile(m.Data)
		m.count++
	}

	if len(m.SystemType) > 0 {
		m.regex.SystemType = regexp.MustCompile(m.SystemType)
		m.count++
	}

	if len(m.Requester) > 0 {
		m.regex.Requester = regexp.MustCompile(m.Requester)
		m.count++
	}

	if len(m.AlertStartTime) > 0 {
		m.regex.AlertStartTime = regexp.MustCompile(m.AlertStartTime)
		m.count++
	}

	if len(m.AlertEndTime) > 0 {
		m.regex.AlertEndTime = regexp.MustCompile(m.AlertEndTime)
		m.count++
	}

	if len(m.AlertLastUpdateTime) > 0 {
		m.regex.AlertLastUpdateTime = regexp.MustCompile(m.AlertLastUpdateTime)
		m.count++
	}

	for _, tag := range m.AlertTags {
		m.regex.AlertTags = append(m.regex.AlertTags, regexp.MustCompile(tag))
		m.count++
	}

	for _, tag := range m.RoomTags {
		m.regex.RoomTags = append(m.regex.RoomTags, regexp.MustCompile(tag))
		m.count++
	}

	for _, tag := range m.DeviceTags {
		m.regex.DeviceTags = append(m.regex.DeviceTags, regexp.MustCompile(tag))
		m.count++
	}
}
