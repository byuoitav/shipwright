package persistence

import (
	"os"
	"strings"
	"sync"
	"time"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/structs"
)

type ElkPersistence struct {
	config PersistConfig

	resolvedBuffer []AlertWrapper
	activeBuffer   map[string]AlertWrapper

	InChannel    chan AlertWrapper
	ReloadConfig chan bool
}

type AlertWrapper struct {
	Alert  structs.Alert //alert to send
	Upsert bool          //true if we want to upsert or false if replace
	Delete bool          //true if we want to delete the active alert if resolved
}

var initOnce sync.Once
var initMu sync.Mutex

var persist ElkPersistence

func init() {
	initOnce = sync.Once{}
	initMu = sync.Mutex{}
}

func GetElkAlertPersist(c PersistConfig) ElkPersistence {
	sync.Once(func() {
		persist = ElkPersistence{
			InChannel:    make(chan AlertWrapper, 1000),
			ReloadConfig: make(chan bool, 1),

			resolvedBuffer: []AlertWrapper{},
			activeBuffer:   map[string]AlertWrapper{},

			config: c,
		}
		go func() {
			for {
				//go get the config

				persist.start() //we do this so that the persist can reload the config by just returning
			}
		}()

	}())

}

func (e *ElkPersist) SendAlert(aw AlertWrapper) *nerr.E {
	e.InChannel <- aw
	return nil
}

func (e *ElkPersist) start() {

	e.parseConfig()

	d, err := time.ParseDuration(e.config.UpdateInterval)
	if err != nil {
		log.L.Fatalf("Bad Update interval in config: %v", e.config.UpdateInterval)
	}

	tick := time.NewTicker(d)

	//figure out our update interval
	for {
		select {

		case <-tick.C:
			e.sendUpdate()

		case <-e.ReloadConfig:
			//reload the config

			return

		case a := <-e.InChannel:
			if a.Alert.Resolved {
				if a.Delete {
					//we need to remove from the active alerts as well
					e.ActiveBuffer[a.Alert.AlertID] = e
				}
				e.ReolvedBuffer = append(e.ResolvedBuffer, a)

			} else {
				if a.Delete {
					//we need to add it to the resolved buffer
					e.ReolvedBuffer = append(e.ResolvedBuffer, a)
				}
				e.ActiveBuffer[a.Alert.AlertID] = e
			}
		}
	}
}

func (e *ElkPersist) sendUpdate() *nerr.E {
	//do our static alert stuff

	//do our reolved alert stuff
}

func (e *ElkPersist) parseConfig() *nerr.E {
	e.config.Address = parseEnv(e.config.Address)
	e.config.User = parseEnv(e.config.User)
	e.config.Pass = parseEnv(e.config.Pass)

	return nil
}

func parseEnv(s string) string {
	if strings.HasPrefix(c, "ENV") {
		return os.Getenv(strings.TrimSpace(strings.TrimPrefix("ENV")))
	}
	return s
}
