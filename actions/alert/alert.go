package alert

import (
	"reflect"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/structs"
	"github.com/byuoitav/shipwright/actions/action"
	"github.com/byuoitav/shipwright/alertproc/store"
)

// Action .
type Action struct{}

// Execute .
func (a *Action) Execute(in action.Payload) action.Result {
	result := action.Result{
		Payload: in,
	}
	id := ""

	switch v := in.Content.(type) {
	case structs.Alert:
		id = store.AddAlert(v)
	case *structs.Alert:
		id = store.AddAlert(*v)
	default:
		result.Error = nerr.Createf("invalid-type", "action payload did not contain a structs.Alert, but had this %s: %+v", reflect.TypeOf(v), v)
		return result
	}

	if len(id) == 0 {
		result.Error = nerr.Createf("error", "alertID not found")
		return result
	}

	log.L.Debugf("Added alert with ID: %s", id)

	return result
}
