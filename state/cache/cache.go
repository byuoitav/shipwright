package cache

import (
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/shipwright/state/cache/shared"
)

//Caches .
var Caches map[string]shared.Cache

func init() {
	log.L.Infof("Initializing Caches")
	//start
	InitializeCaches()

	log.L.Infof("Caches Initialized.")
}

//GetCache .
func GetCache(cacheType string) shared.Cache {
	return Caches[cacheType]
}
