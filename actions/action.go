package actions

import (
	"context"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/shipwright/actions/iff"
	"github.com/byuoitav/shipwright/actions/then"
)

// Action represents an action to be executed based on some conditions
type Action struct {
	Trigger string      `json:"trigger"`
	If      iff.If      `json:"if"`
	Then    []then.Then `json:"then"`
}

// Run checks the 'ifs' of the action and if they all pass, then it runs the 'thens'
func (a *Action) Run(ctx context.Context) {
	if a.If.Check(ctx) {
		for i := range a.Then {
			err := a.Then[i].Execute(ctx)
			if err != nil {
				log.L.Warnf("failed to execute then: %s", err.Error())
			}
		}
	}
}
