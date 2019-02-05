package jobs

import (
	"github.com/byuoitav/shipwright/actions/action"
	"github.com/byuoitav/shipwright/config"
	"github.com/byuoitav/shipwright/jobs/eventbased"
	"github.com/byuoitav/shipwright/jobs/timebased"
	"github.com/byuoitav/shipwright/jobs/timebased/statequery"
)

// Job .
type Job interface {
	Run(ctx config.JobInputContext, actionWrite chan action.Payload)
	GetName() string
}

// Jobs .
var Jobs = map[string]Job{
	timebased.RoomUpdate:           &timebased.RoomUpdateJob{},
	timebased.GeneralAlertClearing: &timebased.GeneralAlertClearingJob{},
	eventbased.SimpleForwarding:    &eventbased.SimpleForwardingJob{},
	eventbased.GenAction:           &eventbased.GenActionJob{},
	statequery.StateQuery:          &statequery.QueryJob{},
}
