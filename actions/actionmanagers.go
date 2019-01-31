package actions

import (
	"sync"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/shipwright/actions/action"
)

var ingestionMap map[string]chan action.Payload

type actionManager struct {
	Name       string
	Action     Action
	ActionChan chan action.Payload
}

func init() {
	ingestionMap = make(map[string]chan action.Payload)
}

func StartActionManagers() {
	var actionList []string
	for name := range Actions {
		actionList = append(actionList, name)
	}

	log.L.Infof("Starting action scheduler. Executing action types: %v", actionList)
	wg := sync.WaitGroup{}

	// build each of the individual action managers
	for name, act := range Actions {
		ingestionMap[name] = make(chan action.Payload, 1000) // TODO make this size configurable?

		wg.Add(1)
		manager := &actionManager{
			Name:       name,
			Action:     act,
			ActionChan: ingestionMap[name],
		}
		go manager.start()
	}

	wg.Wait()
}

// Execute queues an actions to be executed.
func Execute(action action.Payload) {
	if _, ok := ingestionMap[action.Type]; ok {
		ingestionMap[action.Type] <- action
	}
}

func (a *actionManager) start() {
	// TODO scale number of action workers as size of payload chan increases?
	for act := range a.ActionChan {
		go func(action action.Payload) {
			result := a.Action.Execute(action)
			if result.Error != nil {
				log.L.Warnf("failed to execute %s action: %s", result.Payload.Type, result.Error.String())
			}
		}(act)
	}
}
