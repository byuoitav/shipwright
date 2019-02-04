package actions

import (
	"github.com/byuoitav/common/v2/events"
	"github.com/byuoitav/shipwright/config"
)

// If represents the set of conditions to running an action
type If struct {
	EventMatch config.MatchConfig `json:"event-match"`
}

// CheckIf .
func CheckIf() {
}

// CheckIfWithEvent .
func CheckIfWithEvent(events.Event) {
}
