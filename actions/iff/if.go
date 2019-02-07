package iff

import (
	"context"

	"go.uber.org/zap"
)

// If represents the set of conditions to running an action
type If struct {
	EventMatch *EventMatch `json:"event-match"`
	AlertMatch *AlertMatch `json:"alert-match"`
	//	StateQuery *StateQuery `json:"state-query"`
}

// Check returns whether or not the if check passes
func (i *If) Check(ctx context.Context, log *zap.SugaredLogger) (context.Context, bool) {
	if i.EventMatch != nil && !i.EventMatch.DoesEventMatch(ctx) {
		log.Debugf("Failed if check at event match")
		// return false
	}

	if i.AlertMatch != nil && !i.AlertMatch.DoesAlertMatch(ctx) {
		log.Debugf("Failed if check at alert match")
		// return false
	}
	/*
		if i.StateQuery != nil && !i.StateQuery.Check(ctx) {
			log.Debugf("Failed if check at alert match")
			return false
		}
	*/

	return context.TODO(), true
}
