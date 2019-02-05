package eventbased

import (
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	v2 "github.com/byuoitav/common/v2/events"
	"github.com/byuoitav/shipwright/actions/action"
	"github.com/byuoitav/shipwright/config"
	"github.com/byuoitav/shipwright/jobs/actiongen"
)

const (
	//GenAction .
	GenAction = "action-gen"
)

//GenActionJob .
type GenActionJob struct{}

//Run .
func (r *GenActionJob) Run(input config.JobInputContext, c chan action.Payload) {
	var a action.Payload
	var err *nerr.E

	switch v := input.Context.(type) {
	case v2.Event:
		a, err = actiongen.GenerateAction(input.Action, v, "")
	case *v2.Event:
		a, err = actiongen.GenerateAction(input.Action, *v, "")
	default:
		return
	}
	if err != nil {
		log.L.Warnf("Couldn't generate action %v:%s", err.Error(), err.Stack)
		return
	}

	c <- a
}

//GetName .
func (r *GenActionJob) GetName() string {
	return "action-gen"
}
