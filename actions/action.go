package actions

import (
	"context"

	"github.com/byuoitav/common/log"
	"go.uber.org/zap"
)

// Action represents an action to be executed based on some conditions
type Action struct {
	Name    string `json:"name"`
	Trigger string `json:"trigger"`
	If      If     `json:"if"`
	Then    []Then `json:"then"`

	Log *zap.SugaredLogger

	prune bool
}

// Run checks the 'ifs' of the action and if they all pass, then it runs the 'thens'
func (a *Action) Run(ctx context.Context) {
	if a.prune {
		return
	}

	if a.Log == nil {
		a.Log = log.L.Named(a.Name)
	}

	if ctx, passed := a.If.Check(ctx, a.Log); passed {
		a.Log.Debugf("Passed if checks, running then's")

		for i := range a.Then {
			err := a.Then[i].Execute(ctx, a.Log)
			if err != nil {
				a.Log.Warnf("failed to execute then: %s", err.Error())
			}
		}
	}
}

// Kill stops the action from ever being ran again.
func (a *Action) Kill() {
	if a.Log != nil {
		a.Log.Debugf("Marking action '%s' for deletion", a.Name)
	} else {
		log.L.Debugf("Marking action '%s' for deletion", a.Name)
	}

	a.prune = true
}

// Killed returns wheter or not the action has been killed
func (a *Action) Killed() bool {
	return a.prune
}
