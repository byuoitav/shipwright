package actions

import (
	"context"
	"strings"
	"sync"
	"time"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/v2/events"
	"github.com/byuoitav/shipwright/actions/actionctx"
)

// An ActionManager manages executing a set of actions
type ActionManager struct {
	Config      *ActionConfig
	Workers     int
	EventStream chan events.Event
	EventCache  string

	matchActionsMu sync.RWMutex
	matchActions   []*Action

	managedActionsMu sync.RWMutex
	managedActions   []*Action

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
			Config:      DefaultConfig(),
			Workers:     1000,
			EventStream: make(chan events.Event, 10000),
			EventCache:  "default",
		}
	})

	return defaultAM
}

// Start starts the action manager
func (a *ActionManager) Start(ctx context.Context) *nerr.E {
	a.ctx = ctx
	a.wg = &sync.WaitGroup{}
	a.reqs = make(chan *ActionRequest, 5000)

	if a.Config == nil {
		a.Config = DefaultConfig()
	}

	if a.Workers <= 0 {
		a.Workers = 1
	}

	prev, _ := log.GetLevel()
	log.SetLevel("info")

	log.L.Infof("Starting action manager with %d workers", a.Workers)

	ctx, cancel := context.WithCancel(ctx)
	defer cancel() // clean up resources if the action manager ever exits

	for i := range a.Config.Actions {
		a.ManageAction(a.Config.Actions[i])
	}

	log.SetLevel(prev)

	for i := 0; i < a.Workers/2; i++ {
		a.wg.Add(1)

		go func(index int) {
			defer a.wg.Done()
			defer log.L.Infof("Closed action manager worker %d", index)

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

	for i := a.Workers / 2; i < a.Workers; i++ {
		a.wg.Add(1)

		go func(index int) {
			defer a.wg.Done()
			defer log.L.Infof("Closed action manager worker %d", index)

			for {
				select {
				case <-ctx.Done():
					return
				case event, ok := <-a.EventStream:
					if !ok {
						log.L.Warnf("action manager event stream closed")
						return
					}
					/*
						if len(a.EventCache) > 0 {
							//get the cache and submit for persistence
							cache.GetCache(a.EventCache).StoreAndForwardEvent(event)
						}
					*/
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
		}(i)
	}

	a.wg.Add(1)
	go func() {
		a.pruneMatchActions(ctx)
		a.wg.Done()
	}()

	a.wg.Wait()
	log.L.Infof("Action manager stopped.")

	return nil
}

func (a *ActionManager) pruneMatchActions(ctx context.Context) {
	defer log.L.Infof("Finished pruning match actions")
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

					// remove it from managed actions
					a.managedActionsMu.RLock()
					idx := -1
					for j := range a.managedActions {
						if a.managedActions[j] == a.matchActions[i] {
							idx = j
							break
						}
					}
					a.managedActionsMu.RUnlock()

					if idx > 0 {
						a.managedActionsMu.Lock()
						a.managedActions[idx] = a.managedActions[len(a.managedActions)-1]
						a.managedActions[len(a.managedActions)-1] = nil
						a.managedActions = a.managedActions[:len(a.managedActions)-1]
						a.managedActionsMu.Unlock()
					}
				}
			}

			a.matchActions = keep
			a.matchActionsMu.Unlock()
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
func (a *ActionManager) ManageAction(action *Action) *nerr.E {
	switch {
	case action.Trigger == "skip":
	case action.Trigger == "event":
		a.matchActionsMu.Lock()
		a.matchActions = append(a.matchActions, action)
		a.matchActionsMu.Unlock()
	case strings.HasPrefix(action.Trigger, "interval:"):
		go a.runActionOnInterval(action)
	default:
		return nerr.Createf("invalid-trigger", "action manager is unable to manage action with trigger '%s'", action.Trigger)
	}

	log.L.Infof("Added '%s' action to action manager with trigger '%s'", action.Name, action.Trigger)

	a.managedActionsMu.Lock()
	a.managedActions = append(a.managedActions, action)
	a.managedActionsMu.Unlock()
	return nil
}
