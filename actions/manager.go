package actions

import (
	"context"
	"os"

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

	matchActions    []*Action
	intervalActions []*Action

	reqs chan *ActionRequest
}

// ActionRequest is submitted to the action manager to run an action on one of it's worker threads
type ActionRequest struct {
	Action  *Action
	Context context.Context
}

// Start starts the action manager
func (a *ActionManager) Start(ctx context.Context) *nerr.E {
	var err *nerr.E

	if a.Config == nil {
		a.Config = DefaultConfig()
	}

	if a.Workers <= 0 {
		a.Workers = 1
	}

	if a.Messenger == nil {
		// connect to the hub
		a.Messenger, err = messenger.BuildMessenger(os.Getenv("HUB_ADDRESS"), base.Messenger, 1000)
		if err != nil {
			return err.Addf("failed to start action manager")
		}

		log.L.Infof("Action messenger connected.")
		a.Messenger.SubscribeToRooms("*")
	}

	a.reqs = make(chan *ActionRequest, 1000)

	ctx, cancel := context.WithCancel(ctx)
	defer cancel() // clean up resources if the action manager ever exits

	for _, action := range a.Config.Actions {
		switch action.Trigger {
		case "event":
			a.matchActions = append(a.matchActions, action)
		default:
			// for now, assume that it is some duration
			/*
				interval, gerr := time.ParseDuration(action.Trigger)
				if gerr != nil {
					log.L.Warnf("unable to parse trigger '%s' to run action. check the action configurations. error: %s", action.Trigger, gerr)
				}

				go a.runActionOnInterval(ctx, interval)
			*/

			a.intervalActions = append(a.intervalActions, action)
		}
	}

	for i := 0; i < a.Workers; i++ {
		go func(index int) {
			for {
				select {
				case <-ctx.Done():
					return
				case req := <-a.reqs:
					req.Action.Run(ctx)
				}
			}
		}(i)
	}

	return nil
}

func (a *ActionManager) runActionsFromEvents(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return
		default:
			event := a.Messenger.ReceiveEvent()

			// a new context for this action
			actx := actionctx.PutEvent(context.Background(), event)
			for i := range a.matchActions {
				a.reqs <- &ActionRequest{
					Context: actx,
					Action:  a.matchActions[i],
				}
			}
		}
	}
}

func (a *ActionManager) runActionsOnInterval(ctx context.Context) {
	// TODO
}

// RunAction submits an action request to be ran by the action manager
func (a *ActionManager) RunAction(ctx context.Context, action *Action) {
	a.reqs <- &ActionRequest{
		Context: ctx,
		Action:  action,
	}
}
