package actions

import (
	"os"

	"github.com/byuoitav/shipwright/actions/action"
	"github.com/byuoitav/shipwright/actions/alert"
	"github.com/byuoitav/shipwright/actions/email"
	"github.com/byuoitav/shipwright/actions/mom"
	"github.com/byuoitav/shipwright/actions/slack"
)

const (
	// Slack ..
	Slack = "slack"

	// Mom ..
	Mom = "mom"

	//Email ..
	Email = "email"

	// Alert .
	Alert = "alert"
)

// An Action is a struct that will execute action payloads created by jobs.
type Action interface {
	Execute(a action.Payload) action.Result
}

// Actions is a map of the action name to an actual Action struct.
var Actions = map[string]Action{
	// fill actions in here
	Slack: &slack.Action{ChannelIdentifier: os.Getenv("SLACK_HEARTBEAT_CHANNEL")},
	Mom:   &mom.Action{},
	Email: &email.Action{},
	Alert: &alert.Action{},
}
