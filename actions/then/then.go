package then

import (
	"context"
	"sync"

	"github.com/byuoitav/common/nerr"
)

// Then represents something to be done as a result of all of an action's If checks passing
type Then struct {
	Do   string `json:"do"`
	With []byte `json:"with"`
}

// Func .
type Func func(ctx context.Context, with []byte) *nerr.E

var (
	thens struct {
		sync.RWMutex
		m map[string]Func
	}
)

func init() {
	thens.Lock()
	thens.m = make(map[string]Func)

	// declare then's here
	thens.m["add-alert"] = AddAlert

	thens.Unlock()
}

// Add .
func Add(name string, f Func) {
	// TODO check if the function already exists
	thens.Lock()
	thens.m[name] = f
	thens.Unlock()
}

// Get .
func Get(name string) Func {
	thens.RLock()
	defer thens.RUnlock()

	return thens.m[name]
}
