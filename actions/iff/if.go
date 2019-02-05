package iff

import (
	"context"
)

// If represents the set of conditions to running an action
type If struct {
	EventMatch *EventMatch `json:"event-match"`
}

// Func .
type Func func(ctx context.Context) bool

// Check returns whether or not the if check passes
func (i *If) Check(ctx context.Context) bool {
	if i.EventMatch == nil || !i.EventMatch.DoesEventMatch(ctx) {
		return false
	}

	return true
}
