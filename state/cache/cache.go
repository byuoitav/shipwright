package cache

import (
	"sync"

	"github.com/byuoitav/shipwright/state/cache/shared"
)

//Caches .
var Caches map[string]shared.Cache
var cachesInit sync.Once

//GetCache .
func GetCache(cacheType string) shared.Cache {
	cachesInit.Do(InitializeCaches)
	return Caches[cacheType]
}
