package actions

import (
	"context"
	"sync/atomic"

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

	prune      uint32
	runCount   uint64 // number of successful runs
	pruneCount uint64 // prune after this number of runs
}

// Run checks the 'ifs' of the action and if they all pass, then it runs the 'thens'
func (a *Action) Run(ctx context.Context) {
	if a.Killed() {
		return
	}

	if a.Log == nil {
		a.Log = log.L.Named(a.Name)
	}

	if ctx, passed := a.If.Check(ctx, a.Log); passed {
		a.Log.Debugf("Passed if checks, running then's")

		count := atomic.AddUint64(&a.runCount, 1)
		pruneCount := atomic.LoadUint64(&a.pruneCount)
		if pruneCount != 0 && count >= pruneCount {
			if count > pruneCount {
				return // in case two threads ran at the same time
			}

			a.Kill()
		}

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
	if a.Killed() {
		return
	}
	atomic.StoreUint32(&a.prune, 1)

	if a.Log != nil {
		a.Log.Debugf("Marking action '%s' for deletion (ran %v times)", a.Name, atomic.LoadUint64(&a.runCount))
	} else {
		log.L.Debugf("Marking action '%s' for deletion (ran %v times)", a.Name, atomic.LoadUint64(&a.runCount))
	}
}

// Killed returns whether or not the action has been killed
func (a *Action) Killed() bool {
	return atomic.LoadUint32(&a.prune) == 1
}

// KillAfter kills the action after running n times
func (a *Action) KillAfter(n int) {
	atomic.StoreUint64(&a.pruneCount, uint64(n))
}
