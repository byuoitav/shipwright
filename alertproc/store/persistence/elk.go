package persistence

import (
	"os"
	"strings"
	"sync"
	"time"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/structs"
	"github.com/byuoitav/shipwright/elk"
)

type ElkPersist struct {
	config PersistConfig

	resolvedBuffer []AlertWrapper
	activeBuffer   map[string]AlertWrapper

	InChannel    chan AlertWrapper
	ReloadConfig chan bool
}

type AlertWrapper struct {
	Alert  structs.Alert //alert to send
	Delete bool          //true if we want to delete the active alert if resolved
}

var initOnce sync.Once
var initMu sync.Mutex

var persist ElkPersist

func init() {
	initOnce = sync.Once{}
	initMu = sync.Mutex{}
}

func GetElkAlertPersist(c PersistConfig) ElkPersist {
	initOnce.Do(func() {
		persist = ElkPersist{
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

	})

	return persist
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
			//reload the config by returning
			return

		case a := <-e.InChannel:
			if a.Alert.Resolved {
				if a.Delete {
					//we need to remove from the active alerts as well
					e.activeBuffer[a.Alert.AlertID] = a
				}
				e.resolvedBuffer = append(e.resolvedBuffer, a)

			} else {
				if a.Delete {
					//we need to add it to the resolved buffer
					e.resolvedBuffer = append(e.resolvedBuffer, a)
				}
				e.activeBuffer[a.Alert.AlertID] = a
			}
		}
	}
}

func (e *ElkPersist) sendUpdate() *nerr.E {

	buf := []elk.ElkBulkUpdateItem{}
	//do our active alert stuff
	for _, v := range e.activeBuffer {
		if v.Delete {
			buf = append(buf, elk.ElkBulkUpdateItem{
				Delete: elk.ElkDeleteHeader{
					Header: elk.HeaderIndex{
						Index: e.config.PersistActiveAlerts.ElkData.IndexPattern,
						Type:  "alert",
						ID:    v.Alert.AlertID,
					}},
			})
		} else {
			buf = append(buf, elk.ElkBulkUpdateItem{
				Index: elk.ElkUpdateHeader{
					Header: elk.HeaderIndex{
						Index: e.config.PersistActiveAlerts.ElkData.IndexPattern,
						Type:  "alert",
						ID:    v.Alert.AlertID,
					}},
				Doc: v.Alert,
			})
		}
	}
	//do our reolved alert stuff
	for _, v := range e.resolvedBuffer {
		buf = append(buf, elk.ElkBulkUpdateItem{
			Index: elk.ElkUpdateHeader{
				Header: elk.HeaderIndex{
					Index: e.config.PersistResolvedAlerts.ElkData.IndexPattern,
					Type:  "alert",
					ID:    v.Alert.AlertID,
				}},
			Doc: v.Alert,
		})
	}

	//we forward
	go elk.BulkForward("alert-persistence", e.config.Address, e.config.User, e.config.Pass, buf)

	return nil
}

func (e *ElkPersist) parseConfig() *nerr.E {
	e.config.Address = parseEnv(e.config.Address)
	e.config.User = parseEnv(e.config.User)
	e.config.Pass = parseEnv(e.config.Pass)

	return nil
}

func parseEnv(s string) string {
	if strings.HasPrefix(s, "ENV") {
		return os.Getenv(strings.TrimSpace(strings.TrimPrefix(s, "ENV")))
	}
	return s
}
