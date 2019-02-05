package actions

import (
	"context"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/byuoitav/central-event-system/hub/base"
	"github.com/byuoitav/central-event-system/messenger"
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/shipwright/actions/actionctx"
)

// An ActionManager manages executing a set of actions
type ActionManager struct {
	Config    *ActionConfig
	Workers   int
	Messenger *messenger.Messenger

	matchActionsMu sync.RWMutex
	matchActions   []*Action

	wg   *sync.WaitGroup
	ctx  context.Context // the context passed in when Start() was called
	reqs chan *ActionRequest
}

// ActionRequest is submitted to the action manager to run an action on one of it's worker threads
type ActionRequest struct {
	Action  *Action
	Context context.Context
}

var (
	defaultAM   *ActionManager
	defaultOnce = sync.Once{}
)

// DefaultActionManager .
func DefaultActionManager() *ActionManager {
	defaultOnce.Do(func() {
		defaultAM = &ActionManager{
			Config:  DefaultConfig(),
			Workers: 20,
		}
	})

	return defaultAM
}

// Start starts the action manager
func (a *ActionManager) Start(ctx context.Context) *nerr.E {
	var err *nerr.E
	a.ctx = ctx

	if a.Config == nil {
		a.Config = DefaultConfig()
	}

	if a.Workers <= 0 {
		a.Workers = 1
	}

	log.L.Infof("Starting action manager with %d workers", a.Workers)

	if a.Messenger == nil {
		// connect to the hub
		a.Messenger, err = messenger.BuildMessenger(os.Getenv("HUB_ADDRESS"), base.Messenger, 1000)
		if err != nil {
			return err.Addf("failed to start action manager")
		}

		a.Messenger.SubscribeToRooms("ITB-1010")
	}

	a.reqs = make(chan *ActionRequest, 1000)

	ctx, cancel := context.WithCancel(ctx)
	defer cancel() // clean up resources if the action manager ever exits

	a.wg = &sync.WaitGroup{}

	for i := range a.Config.Actions {
		a.ManageAction(a.Config.Actions[i])
	}

	a.wg.Add(a.Workers)
	for i := 0; i < a.Workers; i++ {
		go func(index int) {
			defer a.wg.Done()
			defer log.L.Infof("Closed action maanger worker %d", index)

			for {
				select {
				case <-ctx.Done():
					return
				case req := <-a.reqs:
					req.Action.Run(req.Context)
				}
			}
		}(i)
	}

	go a.runActionsFromEvents(ctx)

	a.wg.Wait()
	log.L.Infof("Action manager stopped.")

	return nil
}

func (a *ActionManager) runActionsFromEvents(ctx context.Context) {
	a.wg.Add(1)
	defer a.wg.Done()
	defer log.L.Infof("Finished running actions from events")

	pruneTick := time.NewTicker(20 * time.Second)

	for {
		select {
		case <-ctx.Done():
			return
		case <-pruneTick.C:
			keep := []*Action{}

			a.matchActionsMu.Lock()
			for i := range a.matchActions {
				if !a.matchActions[i].Killed() {
					keep = append(keep, a.matchActions[i])
				} else {
					log.L.Infof("Removing action %s from action manager", a.matchActions[i].Name)
				}
			}

			a.matchActions = keep
			a.matchActionsMu.Unlock()
		default:
			event := a.Messenger.ReceiveEvent()

			// a new context for this action
			actx := actionctx.PutEvent(ctx, event)

			a.matchActionsMu.RLock()
			for i := range a.matchActions {
				a.reqs <- &ActionRequest{
					Context: actx,
					Action:  a.matchActions[i],
				}
			}

			a.matchActionsMu.RUnlock()
		}
	}
}

func (a *ActionManager) runActionOnInterval(action *Action) {
	a.wg.Add(1)
	defer a.wg.Done()
	defer log.L.Infof("Removing action %s from action manager", action.Name)

	duration := strings.TrimPrefix(action.Trigger, "interval:")
	duration = strings.TrimSpace(duration)

	// parse duration
	interval, err := time.ParseDuration(duration)
	if err != nil {
		log.L.Errorf("invalid interval for action '%s': %s", action.Name, err)
		return
	}

	ticker := time.NewTicker(interval)

	for {
		select {
		case <-a.ctx.Done():
			return
		case <-ticker.C:
			if action.Killed() {
				return
			}

			a.reqs <- &ActionRequest{
				Context: a.ctx,
				Action:  action,
			}
		}
	}
}

// RunAction submits an action request to be ran by the action manager
func (a *ActionManager) RunAction(ctx context.Context, action *Action) {
	a.reqs <- &ActionRequest{
		Context: ctx,
		Action:  action,
	}
}

// ManageAction adds an action to be managed by the action manager
// currently, an action manager only manages interval and event trigger actions
func (a *ActionManager) ManageAction(action *Action) {
	switch action.Trigger {
	case "skip":
	case "event":
		a.matchActionsMu.Lock()
		a.matchActions = append(a.matchActions, action)
		a.matchActionsMu.Unlock()

		log.L.Infof("Added '%s' action to action manager with trigger '%s'", action.Name, action.Trigger)
	default:
		if strings.HasPrefix(action.Trigger, "interval:") {
			go a.runActionOnInterval(action)
			log.L.Infof("Added '%s' action to action manager with trigger '%s'", action.Name, action.Trigger)
		}
	}
}
