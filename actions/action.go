package actions

import "github.com/byuoitav/common/events"

// Action represents an action to be executed based on some conditions
type Action struct {
	Trigger string `json:"trigger"`
	If      If     `json:"if"`
	Then    []Then `json:"then"`
}

// If represents the set of conditions to running an action
type If struct {
	EventMatch events.Event `json:"event-match"`
}

// Then represents something to be done as a result of an action's If's passing
type Then struct {
	Do   string `json:"do"`
	With []byte `json:"with"`
}
