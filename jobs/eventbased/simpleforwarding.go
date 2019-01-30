package eventbased

import (
	"os"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	v2 "github.com/byuoitav/common/v2/events"
	"github.com/byuoitav/shipwright/actions/action"
	"github.com/byuoitav/shipwright/config"
	"github.com/byuoitav/state-parser/state/cache"
)

const (
	//SimpleForwarding .
	SimpleForwarding = "simple-forwarding"
)

var (
	// APIForward is the url to forward events to
	APIForward = os.Getenv("ELASTIC_API_EVENTS")

	// SecondAPIForward is a second location to forward events to
	SecondAPIForward = os.Getenv("ELASTIC_API_EVENTS_TWO")

	// HeartbeatForward is the url to forward heartbeats to
	HeartbeatForward = os.Getenv("ELASTIC_HEARTBEAT_EVENTS")

	// DMPSEventsForward is the url to forward DMPS events to
	DMPSEventsForward = os.Getenv("ELASTIC_DMPS_EVENTS")

	// DMPSHeartbeatForward is the url to forward DMPS events to
	DMPSHeartbeatForward = os.Getenv("ELASTIC_DMPS_HEARTBEATS")
)

func init() {
}

// SimpleForwardingJob is exported to add it as a job.
type SimpleForwardingJob struct {
}

//LegacyEvent is just a format for checking if it's from a dmps
type LegacyEvent struct {
	v2.Event
}

//GetName .
func (s *SimpleForwardingJob) GetName() string {
	return SimpleForwarding
}

// Run fowards events to an elk timeseries index.
func (s *SimpleForwardingJob) Run(context config.JobInputContext, actionWrite chan action.Payload) {
	log.L.Debugf("Running simple forwarding job.")

	var err *nerr.E
	//	cache.GetCache(forwarding.DEFAULT)
	switch v := context.Context.(type) {
	case v2.Event:
		_, err = cache.GetCache(config.DEFAULT).StoreAndForwardEvent(v)
	case *v2.Event:
		_, err = cache.GetCache(config.DEFAULT).StoreAndForwardEvent(*v)

	case LegacyEvent:
		_, err = cache.GetCache(config.LEGACY).StoreAndForwardEvent(v.Event)
	case *LegacyEvent:
		_, err = cache.GetCache(config.LEGACY).StoreAndForwardEvent(v.Event)

	default:
		log.L.Debugf("default %v", context)
	}

	if err != nil {
		log.L.Warnf("Problem storing event: %v", err.Error())
	}

	return
}
