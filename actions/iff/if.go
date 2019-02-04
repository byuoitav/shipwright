package iff

import (
	"context"
	"sync"
)

// If represents the set of conditions to running an action
type If struct {
	EventMatch EventMatch `json:"event-match"`

	ifs struct {
		sync.RWMutex
		m map[string]Func
	}
}

// Func .
type Func func(ctx context.Context) bool

// AddCheck .
func (i *If) AddCheck(name string, f Func) {
	// TODO check if the function already exists
	i.ifs.Lock()
	i.ifs.m[name] = f
	i.ifs.Unlock()
}

// GetCheck  .
func (i *If) GetCheck(name string) Func {
	i.ifs.RLock()
	defer i.ifs.RUnlock()
	return i.ifs.m[name]
}

// Check returns whether or not the if check passes
func (i *If) Check(ctx context.Context) bool {
	return false
}
