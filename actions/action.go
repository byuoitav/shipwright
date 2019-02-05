package actions

import (
	"context"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/shipwright/actions/iff"
	"github.com/byuoitav/shipwright/actions/then"
	"go.uber.org/zap"
)

// Action represents an action to be executed based on some conditions
type Action struct {
	Name    string      `json:"name"`
	Trigger string      `json:"trigger"`
	If      iff.If      `json:"if"`
	Then    []then.Then `json:"then"`

	Log *zap.SugaredLogger
}

// Run checks the 'ifs' of the action and if they all pass, then it runs the 'thens'
func (a *Action) Run(ctx context.Context) {
	if a.Log == nil {
		a.Log = log.L.Named(a.Name)
	}

	if a.If.Check(ctx, a.Log) {
		a.Log.Debugf("Passed if checks, running then's")

		for i := range a.Then {
			err := a.Then[i].Execute(ctx, a.Log)
			if err != nil {
				a.Log.Warnf("failed to execute then: %s", err.Error())
			}
		}
	}
}
