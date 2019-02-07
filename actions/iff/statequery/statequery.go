package statequery

import (
	"reflect"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	sd "github.com/byuoitav/common/state/statedefinition"
	"github.com/byuoitav/shipwright/actions/action"
	"github.com/byuoitav/shipwright/config"
	"github.com/byuoitav/shipwright/jobs/actiongen"
	"github.com/byuoitav/state-parser/state/cache"
)

const (
	//StateQuery is the job name
	StateQuery = "state-query"
)

/*
QueryJob is a job that will query the state of the static cache and generate events.
This job expects three fields in the input configuration:
query
cache-type
data-type

query:
The query string, in the format defined below:

S -> SbS | oSc | qaq p qvq

b -> "||" | "&"
o -> (
c -> )
p -> ">" | "=" | "<" | "!="
q -> Literal " character | literal ' character

a -> some field of the queried struct
v -> a literal value


  Basically it provides very basic boolean expressions. AND, OR, and NOT. Nesting is permitted. =, < and > are also permitted for comparison operators. Left hand of comparison operators shoudl always be
  Field names of elements in the record of provided type. Right hand should always be an absolute value.

  For time-based fields you can use a relative time in the format of -15m (fifteen minutes ago). See the golang time format package for acceptable values.

cache-type:
The Cache to query See the cache config for acceptable values.

data-type:
The type of record within the cache to query. See the cache config for acceptable values.

*/
type QueryJob struct {
	query QueryRunner
}

//Run .
func (j *QueryJob) Run(input config.JobInputContext, actionWrite chan action.Payload) {

	ok := true

	//check for the values in the input config that we need
	tmp, o := input.InputConfig["query"]
	ok = ok && o
	log.L.Debugf("%v-%v", reflect.TypeOf(tmp), ok)

	Query, o := tmp.(string)
	ok = ok && o

	tmp, o = input.InputConfig["cache-type"]
	ok = ok && o
	log.L.Debugf("%v-%v", reflect.TypeOf(tmp), ok)

	Cache, o := tmp.(string)
	ok = ok && o

	tmp, o = input.InputConfig["data-type"]
	ok = ok && o
	log.L.Debugf("%v-%v", reflect.TypeOf(tmp), ok)

	datatype, o := tmp.(string)
	ok = ok && o

	if !ok {
		log.L.Errorf("Invalid job config for QueryJob: %v", input.InputConfig)
	}

	var d []sd.StaticDevice
	var r []sd.StaticRoom
	var er *nerr.E
	//we're gonna get all the records from the cache
	c := cache.GetCache(Cache)
	switch datatype {
	case "room":
		r, er = c.GetAllRoomRecords()

	case "device":
		d, er = c.GetAllDeviceRecords()

	default:
		log.L.Errorf("Invalid data-type: %v", datatype)
		return
	}
	if er != nil {
		log.L.Errorf("Problem getting all devices from the cache: %v", er.Error())
		return
	}

	//build our query
	j.query, er = ParseQuery(Query)
	if er != nil {
		log.L.Errorf("There was a problem generating the query %v: %v", Query, er.Error())
		return
	}

	//now we take our matching rooms and matching devices and pass them to the action generation function
	for _, i := range d {
		t, er := j.query.rootNode.Evaluate(i)
		if er != nil {
			log.L.Errorf("Couldn't evaluate device %v with query %v. Problem: %v", i.DeviceID, Query, er.Error())
			continue
		}
		if t {
			a, er := actiongen.GenerateAction(input.Action, i, "")
			if er != nil {
				log.L.Errorf("Problem generating the action for %v based on query %v: %v", i.DeviceID, Query, er.Error())
				continue
			}
			actionWrite <- a
		}
	}
	for _, i := range r {
		t, er := j.query.rootNode.Evaluate(i)
		if er != nil {
			log.L.Errorf("Couldn't evaluate room %v with query %v. Problem: %v", i.RoomID, Query, er.Error())
			continue
		}
		if t {
			a, er := actiongen.GenerateAction(input.Action, i, "")
			if er != nil {
				log.L.Errorf("Problem generating the action for %v based on query %v: %v", i.RoomID, Query, er.Error())
				continue
			}
			actionWrite <- a
		}
	}

}

//GetName .
func (j *QueryJob) GetName() string {
	return StateQuery
}
