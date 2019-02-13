package marking

import (
	"time"

	"github.com/byuoitav/common/log"
	sd "github.com/byuoitav/common/state/statedefinition"
	"github.com/byuoitav/state-parser/config"
	"github.com/byuoitav/state-parser/state/cache"
)

func MarkRoomGeneralAlerting(toMark []string, alerting bool) {

	room := sd.StaticRoom{
		UpdateTimes: make(map[string]time.Time),
	}
	room.Alerting = &alerting

	//ship it off to go with the rest
	for i := range toMark {
		room.RoomID = toMark[i]
		_, _, err := cache.GetCache(config.DEFAULT).CheckAndStoreRoom(room)
		if err != nil {
			log.L.Errorf("Couldn't clear general alert for %v: %v", toMark[i], err.Error())

		}
	}
}
