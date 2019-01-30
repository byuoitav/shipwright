package eventstore

import (
	"sync"
	"time"

	"github.com/byuoitav/common/v2/events"
)

// Store .
type Store struct {
	onChange func(events []events.Event)
	prune    func(events []events.Event)
	sort     func(events []events.Event)

	unusedKeyTTL time.Duration

	// there is one manager per key in the event map
	managersMu sync.RWMutex
	managers   map[interface{}]*manager
}

// New .
func New(onChange func(events []events.Event)) *Store {
	return &Store{
		unusedKeyTTL: 2 * time.Minute,
		onChange:     onChange,
		managers:     make(map[interface{}]*manager),
	}
}

// Store .
func (s *Store) Store(key interface{}, value events.Event) {
	// check if the key already exists
	s.managersMu.RLock()
	man := s.managers[key]
	s.managersMu.RUnlock()

	if man == nil {
		// spin up a new manager for this key
		man = &manager{
			store:        s,
			key:          key,
			newEventChan: make(chan events.Event, 50),
		}

		go man.Start()

		// add manager into map
		s.managersMu.Lock()
		s.managers[key] = man
		s.managersMu.Unlock()
	}

	// add the event into the list
	man.newEventChan <- value
}

// SetPrune .
func (s *Store) SetPrune(prune func([]events.Event)) {
	s.prune = prune
}

// SetSort .
func (s *Store) SetSort(sort func([]events.Event)) {
	s.sort = sort
}

// Delete .
func (s *Store) Delete(key interface{}) {
	// check if the key already exists
	s.managersMu.RLock()
	man := s.managers[key]
	s.managersMu.RUnlock()

	if man != nil {
		// delete the key
		s.managersMu.Lock()
		delete(s.managers, key)
		s.managersMu.Unlock()

		go func() {
			// wait to make sure nobody else has a pointer to man
			// and is waiting to write to newEventChan
			time.Sleep(20 * time.Second)
			close(man.newEventChan)
		}()
	}
}

// Clear clears all the keys from the map store
func (s *Store) Clear() {
	s.managersMu.Lock()
	for key, val := range s.managers {
		delete(s.managers, key)

		if val != nil {
			go func(man *manager) {
				time.Sleep(20 * time.Second)
				close(man.newEventChan)
			}(val)
		}
	}
	s.managersMu.Unlock()
}
