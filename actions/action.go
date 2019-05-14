package actions

import (
	"context"
	"sync/atomic"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/shipwright/actions/actionctx"
	"github.com/byuoitav/shipwright/actions/iff"
	"github.com/byuoitav/shipwright/actions/then"
	"go.uber.org/zap"
)

// Action represents an action to be executed based on some conditions
type Action struct {
	atomicFields // must be first for 64-bit alignment

	Name    string      `json:"name"`
	Trigger string      `json:"trigger"`
	If      iff.If      `json:"if"`
	Then    []then.Then `json:"then"`

	Log *zap.SugaredLogger `json:"-"`
}

type atomicFields struct {
	// kill this action when runCount hits this number
	PruneCount uint64 `json:"kill-after"`

	// the total number of successful runs (successful means that the if checks passed)
	runCount uint64

	// whether or not this action has been killed (will always be either 1 or 0)
	prune uint32
}

// Run checks the 'ifs' of the action and if they all pass, then it runs the 'thens'
func (a *Action) Run(ctx context.Context) {
	if a.Killed() {
		return
	}

	if a.Log == nil {
		a.Log = log.L.Named(a.Name)
	}

	defer func() {
		if r := recover(); r != nil {
			a.Log.Errorf("Caught panic: %s", r)
		}
	}()

	a.Log.Debugf("Running if checks")
	if ctx, passed := a.If.Check(ctx, a.Log); passed {
		count := atomic.AddUint64(&a.runCount, 1)
		pruneCount := atomic.LoadUint64(&a.PruneCount)
		if pruneCount != 0 && count >= pruneCount {
			if count > pruneCount {
				return // in case two threads ran at the same time
			}

			a.Kill()
		}

		if pruneCount != 0 {
			a.Log.Infof("If checks passed; Running %d thens (run #%v/%v)", len(a.Then), count, pruneCount)
		} else {
			a.Log.Infof("If checks passed; Running %d thens", len(a.Then))
		}

		exec := func(c context.Context) {
			for i := range a.Then {
				err := a.Then[i].Execute(c, a.Log)
				if err != nil {
					a.Log.Warnf("failed to execute then: %s", err.Error())
				}
			}
		}

		// pull out static devices, if there are any
		devices, ok := actionctx.GetStaticDevices(ctx)
		if !ok {
			// just execute like normal
			exec(ctx)
		} else {
			for i := range devices {
				// overwrite ctx so it only has one devices
				c := actionctx.PutStaticDevice(ctx, devices[i])
				exec(c)
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
	atomic.StoreUint64(&a.PruneCount, uint64(n))
}
