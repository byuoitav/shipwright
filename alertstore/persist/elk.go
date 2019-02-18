package persist

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/structs"
	"github.com/byuoitav/shipwright/alertstore/config"
	"github.com/byuoitav/shipwright/elk"
)

type ElkPersist struct {
	config config.PersistConfig

	resolvedBuffer []AlertWrapper
	activeBuffer   map[string]AlertWrapper

	InChannel    chan AlertWrapper
	ReloadConfig chan bool
}

type AlertWrapper struct {
	Alert  structs.Alert //alert to send
	Delete bool          //true if we want to delete the active alert if resolved
	Format bool          //true if we want to reformat the alert id when I submit
}

var initOnce sync.Once
var initMu sync.Mutex

var per *ElkPersist

func init() {
	initOnce = sync.Once{}
	initMu = sync.Mutex{}
}

func GetAllActiveAlertsFromPersist() ([]structs.Alert, *nerr.E) {
	alerts := []structs.Alert{}
	query := elk.AllQuery{Size: 10000}
	query.Query.MatchAll = map[string]interface{}{}

	config := config.GetConfig().Persist

	b, err := elk.MakeGenericELKRequest(fmt.Sprintf("%v/%v/_search", config.Address, config.PersistActiveAlerts.ElkData.IndexPattern), "POST", query, config.User, config.Pass)
	if err != nil {
		log.L.Fatalf("Couldn't get active alerts from persistence: %v", err.Error())
	}

	resp := elk.AlertQueryResponse{}

	er := json.Unmarshal(b, &resp)
	if er != nil {
		log.L.Fatalf("Couldn't get active alerts from persistence: %v", err.Error())
	}

	for _, i := range resp.Hits.Wrappers {
		alerts = append(alerts, i.Alert)
	}

	return alerts, nil
}

func GetElkAlertPersist() *ElkPersist {
	log.L.Debugf("getting the alert persistence manager")
	initOnce.Do(func() {
		log.L.Infof("Starting the persistence manager")
		per = &ElkPersist{
			InChannel:    make(chan AlertWrapper, 1000),
			ReloadConfig: make(chan bool, 1),

			resolvedBuffer: []AlertWrapper{},
			activeBuffer:   map[string]AlertWrapper{},
		}
		go func() {
			for {
				//go get the config
				per.config = config.GetConfig().Persist
				log.L.Debugf("Starting persistence manager with config %v", per.config)

				per.start() //we do this so that the persist can reload the config by just returning
			}
		}()

	})

	return per
}

func (e *ElkPersist) StoreAlert(a structs.Alert, del, reformatID bool) *nerr.E {
	e.InChannel <- AlertWrapper{Alert: a, Delete: del, Format: reformatID}
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
			log.L.Infof("Reloading the config")
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

		if v.Format {
			v.Alert.AlertID = v.Alert.AlertID + v.Alert.ResolutionInfo.ResolvedAt.Format(time.RFC3339)
		}

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

	if len(buf) > 0 {
		//we forward
		go elk.BulkForward("alert-persistence", e.config.Address, e.config.User, e.config.Pass, buf)
	}
	e.resetBuffers()

	return nil
}

func (e *ElkPersist) resetBuffers() {
	e.resolvedBuffer = []AlertWrapper{}
	e.activeBuffer = map[string]AlertWrapper{}
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
