package alertcache

import (
	"sync"

	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/structs"
	"github.com/byuoitav/shipwright/alertstore/config"
)

const (
	NotFound = "not-found"
	BadID    = "bad-id"
)

//NOTE: the assumption is that the alert caches are NOT safe for concurrent access, concurrency saftey is handled at a higher level.
type AlertCache interface {
	GetIssue(string) (structs.RoomIssue, *nerr.E)
	GetAllIssues() ([]structs.RoomIssue, *nerr.E)
	PutIssue(structs.RoomIssue) *nerr.E
	DeleteIssue(string) *nerr.E
}

var cacheinit = sync.Once{}

var caches = map[string]AlertCache{}

func GetAlertCache(name string) AlertCache {
	cacheinit.Do(initializecaches)
	return caches[name]
}

func initializecaches() {
	c := config.GetConfig().Caches
	for i := range c {
		switch c[i].Type {
		case config.Redis:
			caches[c[i].Name] = getRedisAlertCache(c[i])
		case config.Memory:
			caches[c[i].Name] = &MemoryAlertCache{
				m: &sync.Map{},
			}
		}
	}
}
