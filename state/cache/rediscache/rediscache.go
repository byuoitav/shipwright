package rediscache

import (
	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/state/statedefinition"
	"github.com/byuoitav/shipwright/state/cache/shared"
)

func MakeRedisCache(devices []statedefinition.StaticDevice, rooms []statedefinition.StaticRoom, pushCron, name string) (shared.Cache, *nerr.E) {

	return nil, nil
}
