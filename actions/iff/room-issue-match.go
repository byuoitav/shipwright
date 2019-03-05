package iff

import (
	"context"
	"regexp"
	"sync"

	"github.com/byuoitav/shipwright/actions/actionctx"
)

// RoomIssueMatch .
type RoomIssueMatch struct {
	count int
	init  sync.Once

	RoomIssueID string `json:"id,omitempty"`
	BuildingID  string `json:"buildingID,omitempty"`
	RoomID      string `json:"roomID,omitempty"`

	Severities []string `json:"severity,omitempty"`

	RoomTags []string `json:"room-tags,omitempty"`

	AlertTypes      []string `json:"alert-types,omitempty"`
	AlertDevices    []string `json:"alert-devices,omitempty"`
	AlertCategories []string `json:"alert-categories,omitempty"`
	AlertSeverities []string `json:"alert-severities,omitempty"`
	AlertCount      *int     `json:"alert-count,omitempty"`

	ActiveAlertTypes      []string `json:"active-alert-types,omitempty"`
	ActiveAlertDevices    []string `json:"active-alert-devices,omitempty"`
	ActiveAlertCategories []string `json:"active-alert-categories,omitempty"`
	ActiveAlertSeverities []string `json:"active-alert-severities,omitempty"`
	AlertActiveCount      *int     `json:"active-alert-count,omitempty"`

	SystemType string `json:"system-type,omitempty"`

	IssueTags  []string `json:"issue-tags,omitempty"`
	IncidentID []string `json:"incident-id,omitempty"`
	Notes      string   `json:"notes,omitempty"`

	Responders    []string `json:"responders,omitempty"`
	HelpSentAt    string   `json:"help-sent-at,omitempty"`
	HelpArrivedAt string   `json:"help-arrived-at,omitempty"`

	Resolved       *bool `json:"resolved,omitempty"`
	ResolutionInfo struct {
		Code       string `json:"resolution-code,omitempty"`
		Notes      string `json:"notes,omitempty"`
		ResolvedAt string `json:"resolved-at,omitempty"`
	} `json:"resolution-info,omitempty"`

	NotesLog []string `json:"notes-log,omitempty"`

	regex struct {
		RoomIssueID *regexp.Regexp
		BuildingID  *regexp.Regexp
		RoomID      *regexp.Regexp

		RoomTags []*regexp.Regexp

		AlertTypes      []*regexp.Regexp
		AlertDevices    []*regexp.Regexp
		AlertCategories []*regexp.Regexp
		AlertSeverities []*regexp.Regexp

		ActiveAlertTypes      []*regexp.Regexp
		ActiveAlertDevices    []*regexp.Regexp
		ActiveAlertCategories []*regexp.Regexp
		ActiveAlertSeverities []*regexp.Regexp

		SystemType *regexp.Regexp

		IssueTags  []*regexp.Regexp
		IncidentID []*regexp.Regexp
		Notes      *regexp.Regexp

		Responders    []*regexp.Regexp
		HelpSentAt    *regexp.Regexp
		HelpArrivedAt *regexp.Regexp

		ResolutionInfo struct {
			Code       *regexp.Regexp
			Notes      *regexp.Regexp
			ResolvedAt *regexp.Regexp
		}

		NotesLog []*regexp.Regexp
	}
}

// DoesRoomIssueMatch .
func (m *RoomIssueMatch) DoesRoomIssueMatch(ctx context.Context) bool {
	m.init.Do(m.buildRegex)

	if m.count == 0 {
		return true
	}

	issue, ok := actionctx.GetRoomIssue(ctx)
	if !ok {
		return false
	}

	// do bools/ints first
	if m.AlertCount != nil {
		if issue.AlertCount != *m.AlertCount {
			return false
		}
	}

	if m.AlertActiveCount != nil {
		if issue.AlertActiveCount != *m.AlertActiveCount {
			return false
		}
	}

	if m.Resolved != nil {
		if issue.Resolved != *m.Resolved {
			return false
		}
	}

	// then do the rest

	if m.regex.RoomIssueID != nil {
		reg := m.regex.RoomIssueID.Copy()
		if !reg.MatchString(issue.RoomIssueID) {
			return false
		}
	}

	if m.regex.BuildingID != nil {
		reg := m.regex.BuildingID.Copy()
		if !reg.MatchString(issue.BuildingID) {
			return false
		}
	}

	if m.regex.RoomID != nil {
		reg := m.regex.RoomID.Copy()
		if !reg.MatchString(issue.RoomID) {
			return false
		}
	}

	if len(m.regex.RoomTags) > 0 {
		matched := 0

		for _, regex := range m.regex.RoomTags {
			reg := regex.Copy()

			for _, s := range issue.RoomTags {
				if reg.MatchString(s) {
					matched++
					break
				}
			}
		}

		if matched != len(m.regex.RoomTags) {
			return false
		}
	}

	if len(m.regex.AlertTypes) > 0 {
		matched := 0

		for _, regex := range m.regex.AlertTypes {
			reg := regex.Copy()

			for _, s := range issue.AlertTypes {
				if reg.MatchString(string(s)) {
					matched++
					break
				}
			}
		}

		if matched != len(m.regex.AlertTypes) {
			return false
		}
	}

	if len(m.regex.AlertSeverities) > 0 {
		matched := 0

		for _, regex := range m.regex.AlertSeverities {
			reg := regex.Copy()

			for _, s := range issue.AlertSeverities {
				if reg.MatchString(string(s)) {
					matched++
					break
				}
			}
		}

		if matched != len(m.regex.AlertSeverities) {
			return false
		}
	}

	if len(m.regex.AlertDevices) > 0 {
		matched := 0

		for _, regex := range m.regex.AlertDevices {
			reg := regex.Copy()

			for _, s := range issue.AlertDevices {
				if reg.MatchString(s) {
					matched++
					break
				}
			}
		}

		if matched != len(m.regex.AlertDevices) {
			return false
		}
	}

	if len(m.regex.AlertCategories) > 0 {
		matched := 0

		for _, regex := range m.regex.AlertCategories {
			reg := regex.Copy()

			for _, s := range issue.AlertCategories {
				if reg.MatchString(string(s)) {
					matched++
					break
				}
			}
		}

		if matched != len(m.regex.AlertCategories) {
			return false
		}
	}

	if len(m.regex.ActiveAlertTypes) > 0 {
		matched := 0

		for _, regex := range m.regex.ActiveAlertTypes {
			reg := regex.Copy()

			for _, s := range issue.ActiveAlertTypes {
				if reg.MatchString(string(s)) {
					matched++
					break
				}
			}
		}

		if matched != len(m.regex.ActiveAlertTypes) {
			return false
		}
	}
	if len(m.regex.ActiveAlertSeverities) > 0 {
		matched := 0

		for _, regex := range m.regex.ActiveAlertSeverities {
			reg := regex.Copy()

			for _, s := range issue.ActiveAlertSeverities {
				if reg.MatchString(string(s)) {
					matched++
					break
				}
			}
		}

		if matched != len(m.regex.ActiveAlertSeverities) {
			return false
		}
	}

	if len(m.regex.ActiveAlertDevices) > 0 {
		matched := 0

		for _, regex := range m.regex.ActiveAlertDevices {
			reg := regex.Copy()

			for _, s := range issue.ActiveAlertDevices {
				if reg.MatchString(s) {
					matched++
					break
				}
			}
		}

		if matched != len(m.regex.ActiveAlertDevices) {
			return false
		}
	}

	if len(m.regex.ActiveAlertCategories) > 0 {
		matched := 0

		for _, regex := range m.regex.ActiveAlertCategories {
			reg := regex.Copy()

			for _, s := range issue.ActiveAlertCategories {
				if reg.MatchString(string(s)) {
					matched++
					break
				}
			}
		}

		if matched != len(m.regex.ActiveAlertCategories) {
			return false
		}
	}

	if m.regex.SystemType != nil {
		reg := m.regex.SystemType.Copy()
		if !reg.MatchString(issue.SystemType) {
			return false
		}
	}

	if len(m.regex.IssueTags) > 0 {
		matched := 0

		for _, regex := range m.regex.IssueTags {
			reg := regex.Copy()

			for _, s := range issue.IssueTags {
				if reg.MatchString(s) {
					matched++
					break
				}
			}
		}

		if matched != len(m.regex.IssueTags) {
			return false
		}
	}

	if len(m.regex.IncidentID) > 0 {
		matched := 0

		for _, regex := range m.regex.IncidentID {
			reg := regex.Copy()

			for _, s := range issue.IncidentID {
				if reg.MatchString(string(s)) {
					matched++
					break
				}
			}
		}

		if matched != len(m.regex.IncidentID) {
			return false
		}
	}

	if m.regex.Notes != nil {
		reg := m.regex.Notes.Copy()
		if !reg.MatchString(issue.Notes) {
			return false
		}
	}

	if len(m.regex.Responders) > 0 {
		matched := 0

		for _, regex := range m.regex.Responders {
			reg := regex.Copy()

			for _, s := range issue.Responders {
				if reg.MatchString(s) {
					matched++
					break
				}
			}
		}

		if matched != len(m.regex.Responders) {
			return false
		}
	}

	if m.regex.HelpSentAt != nil {
		reg := m.regex.HelpSentAt.Copy()
		if !reg.MatchString(issue.HelpSentAt.String()) {
			return false
		}
	}

	if m.regex.HelpArrivedAt != nil {
		reg := m.regex.HelpArrivedAt.Copy()
		if !reg.MatchString(issue.HelpArrivedAt.String()) {
			return false
		}
	}

	if m.regex.ResolutionInfo.Code != nil {
		reg := m.regex.ResolutionInfo.Code.Copy()
		if !reg.MatchString(issue.ResolutionInfo.Code) {
			return false
		}
	}

	if m.regex.ResolutionInfo.Notes != nil {
		reg := m.regex.ResolutionInfo.Notes.Copy()
		if !reg.MatchString(issue.ResolutionInfo.Notes) {
			return false
		}
	}

	if m.regex.ResolutionInfo.ResolvedAt != nil {
		reg := m.regex.ResolutionInfo.ResolvedAt.Copy()
		if !reg.MatchString(issue.ResolutionInfo.ResolvedAt.String()) {
			return false
		}
	}

	return true
}

func (m *RoomIssueMatch) buildRegex() {
	m.count = 0

	if len(m.RoomIssueID) > 0 {
		m.regex.RoomIssueID = regexp.MustCompile(m.RoomIssueID)
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

	for _, s := range m.RoomTags {
		m.regex.RoomTags = append(m.regex.RoomTags, regexp.MustCompile(s))
		m.count++
	}

	for _, s := range m.AlertTypes {
		m.regex.AlertTypes = append(m.regex.AlertTypes, regexp.MustCompile(s))
		m.count++
	}

	for _, s := range m.AlertDevices {
		m.regex.AlertDevices = append(m.regex.AlertDevices, regexp.MustCompile(s))
		m.count++
	}

	for _, s := range m.AlertCategories {
		m.regex.AlertCategories = append(m.regex.AlertCategories, regexp.MustCompile(s))
		m.count++
	}

	for _, s := range m.AlertSeverities {
		m.regex.AlertCategories = append(m.regex.AlertCategories, regexp.MustCompile(s))
		m.count++
	}

	for _, s := range m.ActiveAlertTypes {
		m.regex.ActiveAlertTypes = append(m.regex.ActiveAlertTypes, regexp.MustCompile(s))
		m.count++
	}

	for _, s := range m.ActiveAlertDevices {
		m.regex.ActiveAlertDevices = append(m.regex.ActiveAlertDevices, regexp.MustCompile(s))
		m.count++
	}

	for _, s := range m.ActiveAlertCategories {
		m.regex.ActiveAlertCategories = append(m.regex.ActiveAlertCategories, regexp.MustCompile(s))
		m.count++
	}
	for _, s := range m.ActiveAlertSeverities {
		m.regex.ActiveAlertSeverities = append(m.regex.ActiveAlertSeverities, regexp.MustCompile(s))
		m.count++
	}

	if len(m.SystemType) > 0 {
		m.regex.SystemType = regexp.MustCompile(m.SystemType)
		m.count++
	}

	for _, s := range m.IssueTags {
		m.regex.IssueTags = append(m.regex.IssueTags, regexp.MustCompile(s))
		m.count++
	}

	for _, s := range m.IncidentID {
		m.regex.IncidentID = append(m.regex.IncidentID, regexp.MustCompile(s))
		m.count++
	}

	if len(m.Notes) > 0 {
		m.regex.Notes = regexp.MustCompile(m.Notes)
		m.count++
	}

	for _, s := range m.Responders {
		m.regex.Responders = append(m.regex.Responders, regexp.MustCompile(s))
		m.count++
	}

	if len(m.HelpSentAt) > 0 {
		m.regex.HelpSentAt = regexp.MustCompile(m.HelpSentAt)
		m.count++
	}

	if len(m.HelpArrivedAt) > 0 {
		m.regex.HelpArrivedAt = regexp.MustCompile(m.HelpArrivedAt)
		m.count++
	}

	if len(m.ResolutionInfo.Code) > 0 {
		m.regex.ResolutionInfo.Code = regexp.MustCompile(m.ResolutionInfo.Code)
		m.count++
	}

	if len(m.ResolutionInfo.Notes) > 0 {
		m.regex.ResolutionInfo.Notes = regexp.MustCompile(m.ResolutionInfo.Notes)
		m.count++
	}

	if len(m.ResolutionInfo.ResolvedAt) > 0 {
		m.regex.ResolutionInfo.ResolvedAt = regexp.MustCompile(m.ResolutionInfo.ResolvedAt)
		m.count++
	}
}
