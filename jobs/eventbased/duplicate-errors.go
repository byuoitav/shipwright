package eventbased

import (
	"fmt"
	"time"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/v2/events"
	"github.com/byuoitav/shipwright/actions"
	"github.com/byuoitav/shipwright/actions/action"
	"github.com/byuoitav/shipwright/actions/slack"
	"github.com/byuoitav/shipwright/config"
	"github.com/byuoitav/shipwright/jobs/eventstore"
)

// DuplicateErrorsJob will watch for "error" events, and if it sees a lot in a short time period, it will fire an alert.
type DuplicateErrorsJob struct {
}

const maxAlertCount = 3

type key struct {
	GeneratingSystem string
	EventKey         string
	EventValue       string
}

var eventStore *eventstore.Store

// build event store in init
func init() {
	eventStore = eventstore.New(areThereDuplicateErrors)
	eventStore.SetPrune(eventstore.PruneDurationAgo(time.Minute * 20))
	eventStore.SetSort(eventstore.SortByTime)
}

// Run is executed each time an event comes through
func (*DuplicateErrorsJob) Run(input config.JobInputContext, actionWrite chan action.Payload) {
	// validate that context contains the correct type
	event, ok := input.Context.(*events.Event)
	if !ok {
		log.L.Warnf("DuplicateErrorsJob only works with v2 events.")
	}

	// build key for store
	k := key{
		GeneratingSystem: event.GeneratingSystem,
		EventKey:         event.Key,
		EventValue:       event.Value,
	}

	eventStore.Store(k, *event)
}

func areThereDuplicateErrors(events []events.Event) {
	if len(events) >= maxAlertCount {
		actions.Execute(action.Payload{
			Type:   actions.Slack,
			Device: events[0].TargetDevice.DeviceID,
			Content: slack.Attachment{
				Fallback: fmt.Sprintf("Duplicate errors detected on %v", events[0].TargetDevice.DeviceID),
				Title:    "Error",
				Fields: []slack.AlertField{
					slack.AlertField{
						Title: "Key",
						Value: events[0].Key,
						Short: true,
					},
					slack.AlertField{
						Title: "Value",
						Value: events[0].Value,
						Short: true,
					},
				},
				Color: "danger",
			},
		})
	}
}
