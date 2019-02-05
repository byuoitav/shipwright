package eventstore

import (
	"sort"
	"time"

	"github.com/byuoitav/common/v2/events"
)

// SortByTime .
func SortByTime(events []events.Event) {
	sort.Slice(events, func(i, j int) bool {
		return events[i].Timestamp.Before(events[j].Timestamp)
	})
}

// PruneDurationAgo .
func PruneDurationAgo(duration time.Duration) func(events []events.Event) {
	return func(evnts []events.Event) {
		cutoff := time.Now().Add(-duration)

		// go backwards so we don't have to worry about deleted index's
		for i := len(evnts) - 1; i >= 0; i-- {
			if evnts[i].Timestamp.Before(cutoff) {
				// delete the item at that index
				evnts = append(evnts[:i], evnts[i+1:]...)
			}
		}
	}
}
