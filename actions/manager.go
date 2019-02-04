package actions

import (
	"context"
	"os"
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

	matchActions   []*Action
	intervalAction []*Action
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
		a.Messenger.SubscribeToRooms("ITB-1010")
	}

	ctx, cancel := context.WithCancel(ctx)
	defer cancel() // clean up resources if the action manager ever exits

	for _, action := range a.Config.Actions {
		switch action.Trigger {
		case "event":
			a.matchActions = append(a.matchActions, action)
		default:
			// for now, assume that it is some duration
			interval, gerr := time.ParseDuration(action.Trigger)
			if gerr != nil {
				log.L.Warnf("unable to parse trigger '%s' to run action. check the action configurations. error: %s", action.Trigger, gerr)
			}

			go a.runActionOnInterval(ctx, interval)
		}
	}

	wg := &sync.WaitGroup{}

	for i := 0; i < a.Workers; i++ {
		wg.Add(1)

		go func(index int) {
			for {
				select {
				case <-ctx.Done():
					wg.Done()
					return
				default:
					event := a.Messenger.ReceiveEvent()

					// a new context for the run of this action
					actx := actionctx.PutEvent(context.Background(), event)

					for i := range a.matchActions {
						a.matchActions[i].Run(actx)
					}
				}
			}
		}(i)
	}

	wg.Wait()

	return nil
}

func (a *ActionManager) runActionOnInterval(ctx context.Context, interval time.Duration) {
}
