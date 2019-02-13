package statequery

import (
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	sd "github.com/byuoitav/common/state/statedefinition"
	"github.com/byuoitav/shipwright/state/cache"
)

/*
Run is a job that will query the state of the static cache and generate events.
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


  Basically it provides very basic boolean expressions. AND, OR, and NOT. Nesting is permitted. =, < and > are also permitted for comparison operators. Left hand of comparison operators should always be
  Field names of elements in the record of provided type. Right hand should always be an absolute value.

  For time-based fields you can use a relative time in the format of -15m (fifteen minutes ago). See the golang time format package for acceptable values.

cache-type:
The Cache to query See the cache config for acceptable values.

data-type:
The type of record within the cache to query. See the cache config for acceptable values.

*/
func (j *QueryRunner) Run() ([]sd.StaticDevice, *nerr.E) {

	var d []sd.StaticDevice
	var er *nerr.E
	//we're gonna get all the records from the cache
	d, er = cache.GetCache(j.CacheName).GetAllDeviceRecords()
	if er != nil {
		log.L.Errorf("Problem getting all devices from the cache: %v", er.Error())
		return d, er
	}

	j.initOnce.Do(func() {
		//build our query
		j.rootNode, er = ParseQuery(j.Query)
		if er != nil {
			log.L.Fatalf("There was a building running the query %v: %v", j.Query, er.Error())
		}
	})

	var toReturn []sd.StaticDevice

	//now we take our matching rooms and matching devices and pass them to the action generation function
	for _, i := range d {
		t, er := j.rootNode.Evaluate(i)
		if er != nil {
			log.L.Errorf("Couldn't evaluate device %v with query %v. Problem: %v", i.DeviceID, j.Query, er.Error())
			return d, er.Addf("Couldn't evaluate device %v with query %v. Problem: %v", i.DeviceID, j.Query, er.Error())
		}
		if t {
			toReturn = append(toReturn, i)
		}
	}
	return toReturn, nil
}

//GetQuery .
func (j *QueryRunner) GetQuery() string {
	return j.Query
}
