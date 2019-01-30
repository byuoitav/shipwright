package eventstore

import (
	"time"

	"github.com/byuoitav/common/v2/events"
)

type manager struct {
	store *Store

	key    interface{}
	events []events.Event

	newEventChan chan events.Event
}

func (m *manager) Start() {
	var lastReceived time.Time
	ticker := time.NewTicker(m.store.unusedKeyTTL / 2)

	go func() {
		for range ticker.C {
			// check if we should delete this key
			if lastReceived.Before(time.Now().Add(-m.store.unusedKeyTTL)) && len(m.events) == 0 {
				m.store.Delete(m.key)
			}
		}
	}()

	for event := range m.newEventChan {
		lastReceived = time.Now()
		m.events = append(m.events, event)

		// prune events
		if m.store.prune != nil {
			m.store.prune(m.events)
		}

		// sort events
		if m.store.sort != nil {
			m.store.sort(m.events)
		}

		// on change
		m.store.onChange(m.events)
	}

	// clean up
	ticker.Stop()
}
