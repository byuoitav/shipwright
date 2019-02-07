package config

/*
// JobConfig .
type JobConfig struct {
	Name           string                 `json:"name"`
	Type           string                 `json:"type"`
	Triggers       []Trigger              `json:"triggers"`
	Enabled        bool                   `json:"enabled"`
	JobInputConfig map[string]interface{} `json:"input-config"`
	Action         actiongen.Config       `json:"action"`
}

// Trigger .
type Trigger struct {
	Type  string       `json:"type"`  // required for all
	At    string       `json:"at"`    // required for 'time and state'
	Every string       `json:"every"` // required for 'interval and state '
	Match *MatchConfig `json:"match"` // required for 'event'
}

// JobInputContext .
type JobInputContext struct {
	InputConfig map[string]interface{} // the config provided.
	Context     interface{}            //the whatever that caused the job to get run.
	Action      actiongen.Config       //from the Action field in the job config
}

// MatchConfig .
type MatchConfig struct {
	Count int

	GeneratingSystem string   `json:"GeneratingSystem"`
	Timestamp        string   `json:"Timestamp"`
	EventTags        []string `json:"EventTags"`
	Key              string   `json:"Key"`
	Value            string   `json:"Value"`
	User             string   `json:"User"`
	Data             string   `json:"Data,omitempty"`
	AffectedRoom     struct {
		BuildingID string `json:"BuildingID,omitempty"`
		RoomID     string `json:"RoomID,omitempty"`
	} `json:"AffectedRoom"`
	TargetDevice struct {
		BuildingID string `json:"BuildingID,omitempty"`
		RoomID     string `json:"RoomID,omitempty"`
		DeviceID   string `json:"DeviceID,omitempty"`
	} `json:"TargetDevice"`

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
func (m *MatchConfig) DoesEventMatch(event *events.Event) bool {
	if m.Count == 0 {
		log.L.Debugf("No runners")
		return true
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
			log.L.Debugf("returrning false.")
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
*/
