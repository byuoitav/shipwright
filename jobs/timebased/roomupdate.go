package timebased

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	sd "github.com/byuoitav/common/state/statedefinition"
	"github.com/byuoitav/shipwright/actions/action"
	"github.com/byuoitav/shipwright/config"
	"github.com/byuoitav/shipwright/elk"
	"github.com/byuoitav/shipwright/state/cache"
)

// RoomUpdateJob .
type RoomUpdateJob struct {
}

const (
	//RoomUpdate .
	RoomUpdate      = "room-update"
	roomUpdateQuery = `
	{
"_source": false,
  "query": {
    "query_string": {
      "query": "*"
    }
  },
  "aggs": {
    "rooms": {
      "terms": {
        "field": "room",
        "size": 1000
      },
      "aggs": {
        "index": {
          "terms": {
            "field": "_index"
          },
          "aggs": {
            "alerting": {
              "terms": {
                "field": "alerting"
              },
              "aggs": {
                "device-name": {
                  "terms": {
                    "field": "hostname",
                    "size": 100
                  }
                }
              }
            },
            "power": {
              "terms": {
                "field": "power"
              },
              "aggs": {
                "device-name": {
                  "terms": {
                    "field": "hostname",
                    "size": 100
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "size": 0
	}
	`
)

type roomQueryResponse struct {
	Aggregations struct {
		Rooms struct {
			Buckets []struct {
				Bucket

				Index struct {
					Buckets []struct {
						Bucket

						Power struct {
							Buckets []struct {
								Bucket

								DeviceName struct {
									Buckets []struct {
										Bucket
									}
								} `json:"device-name"`
							}
						} `json:"power"`

						Alerting struct {
							Buckets []struct {
								Key int `json:"key"`
								Bucket

								DeviceName struct {
									Buckets []struct {
										Bucket
									}
								} `json:"device-name"`
							}
						} `json:"alerting"`
					}
				} `json:"index"`
			}
		} `json:"rooms"`
	} `json:"aggregations"`
}

// Bucket bucket
type Bucket struct {
	Key      string `json:"key"`
	DocCount int    `json:"doc_count"`
}

//GetName .
func (r *RoomUpdateJob) GetName() string {
	return RoomUpdate
}

// Run runs the job
func (r *RoomUpdateJob) Run(input config.JobInputContext, actionWrite chan action.Payload) {
	log.L.Debugf("Starting room update job...")

	body, err := elk.MakeELKRequest(http.MethodPost, fmt.Sprintf("/%s,%s/_search", "", ""), []byte(roomUpdateQuery))
	if err != nil {
		log.L.Warn("failed to make elk request to run room update job: %s", err.String())
		return
	}

	var data roomQueryResponse
	gerr := json.Unmarshal(body, &data)
	if gerr != nil {
		log.L.Warn("failed to unmarshal elk response to run room update job: %s", gerr)
		return
	}

	err = r.processData(data, actionWrite)
	if err != nil {
		log.L.Warnf("failed to process room update data: %s", err.String())
	}

	log.L.Debugf("Finished room update job.")
}

func (r *RoomUpdateJob) processData(data roomQueryResponse, actionWrite chan action.Payload) *nerr.E {
	log.L.Debugf("[%s] Processing room update data.", RoomUpdate)

	updateRoom := make(map[string]sd.StaticRoom)

	for _, room := range data.Aggregations.Rooms.Buckets {
		log.L.Debugf("[%s] Processing room: %s", RoomUpdate, room.Key)

		// make sure both indicies are there
		if len(room.Index.Buckets) > 2 || len(room.Index.Buckets) == 0 {
			indicies := []string{}
			for _, index := range room.Index.Buckets {
				indicies = append(indicies, index.Key)
			}

			log.L.Warnf("[%s] %s has >2 or 0 indicies. ignoring this room. indicies: %s", RoomUpdate, room.Key, indicies)
			continue

		} else if len(room.Index.Buckets) == 1 {
			// one of the indicies is missing
			if room.Index.Buckets[0].Key == "" {
				log.L.Infof("%s doesn't have a room entry, so I'll create one for it.", room.Key)
			} else if room.Index.Buckets[0].Key == "" {
				log.L.Warnf("%s doesn't have any device entries. this room should probably be deleted.", room.Key)
				continue
			} else {
				log.L.Warnf("%s is missing it's room index and device index. it has index: %v", room.Key, room.Index.Buckets[0].Key)
				continue
			}
		}

		deviceIndex := room.Index.Buckets[0]
		roomIndex := room.Index.Buckets[1]

		poweredOn := false
		alerting := false

		// make sure index's are correct
		if deviceIndex.Key != "" {
			deviceIndex = room.Index.Buckets[1]
			roomIndex = room.Index.Buckets[0]
		}

		log.L.Debugf("\tProcessing device index: %v", deviceIndex.Key)

		// check if any devices are powered on
		for _, p := range deviceIndex.Power.Buckets {
			log.L.Debugf("\t\tPower: %v", p.Key)

			if p.Key == elk.POWER_ON {
				poweredOn = true
			}
		}

		// check if any devices are alerting
		for _, a := range deviceIndex.Alerting.Buckets {
			log.L.Debugf("\t\tAlerting: %v", a.Key)

			if a.Key == elk.ALERTING_TRUE {
				alerting = true
			}
		}

		var roomPower = ""
		log.L.Debugf("\tProcessing room index: %v", roomIndex.Key)

		if len(roomIndex.Power.Buckets) == 1 {
			log.L.Debugf("\t\troom power set to: %v", roomIndex.Power.Buckets[0].Key)

			if roomIndex.Power.Buckets[0].Key == elk.POWER_STANDBY && poweredOn {
				// the room is in standby, but there is at least one device powered on
				roomPower = elk.POWER_ON
			} else if roomIndex.Power.Buckets[0].Key == elk.POWER_ON && !poweredOn {
				// the room is on, but there are no devices that are powered on
				roomPower = elk.POWER_STANDBY
			}
		} else if len(roomIndex.Power.Buckets) == 0 {
			log.L.Infof("%s doesn't have a power state. i'll create one for it.", room.Key)

			// set the power state to whatever it's supposed to be
			if poweredOn {
				roomPower = elk.POWER_ON
			} else {
				roomPower = elk.POWER_STANDBY
			}
		} else {
			// this room has more than one power state?
			// we'll just skip this room
			log.L.Warnf("room %s has more than one power state. power buckets: %v", room.Key, roomIndex.Power.Buckets)
			continue
		}

		if len(roomPower) > 0 {
			//update the power
			updateRoomEntry, ok := updateRoom[room.Key]
			if !ok {
				updateRoomEntry = sd.StaticRoom{
					UpdateTimes: make(map[string]time.Time),
					Power:       roomPower,
				}

				updateRoomEntry.UpdateTimes["power"] = time.Now()
			} else {
				updateRoomEntry.Power = roomPower
				updateRoomEntry.UpdateTimes["power"] = time.Now()

			}
			updateRoom[room.Key] = updateRoomEntry
		}

		var roomAlerting *bool

		//for taking pointers :eyeroll:
		var True = true
		var False = false

		if len(roomIndex.Alerting.Buckets) == 1 {
			log.L.Debugf("\t\troom alerting set to: %v", roomIndex.Alerting.Buckets[0].Key)

			if roomIndex.Alerting.Buckets[0].Key == elk.ALERTING_FALSE && alerting {
				// the room is in not alerting, but there is at least one device alerting
				roomAlerting = &True
			} else if roomIndex.Alerting.Buckets[0].Key == elk.ALERTING_TRUE && !alerting {
				// the room is alerting, but there are no devices that are alerting
				roomAlerting = &False
			}
		} else if len(roomIndex.Alerting.Buckets) == 0 {
			log.L.Infof("%s doesn't have an alerting state. i'll create one for it.", room.Key)

			// set the alerting state to whatever it's supposed to be
			if alerting {
				roomAlerting = &True
			} else {
				roomAlerting = &False
			}
		} else {
			// this room has more than one alerting state?
			// we'll just skip this room
			log.L.Warnf("%s has more than one alerting state. alerting buckets: %v", roomIndex.Key, roomIndex.Power.Buckets)
			continue
		}

		if roomAlerting != nil {
			//update the power
			updateRoomEntry, ok := updateRoom[room.Key]
			if !ok {
				updateRoomEntry = sd.StaticRoom{
					UpdateTimes: make(map[string]time.Time),
					Alerting:    roomAlerting,
				}

				updateRoomEntry.UpdateTimes["alerting"] = time.Now()
			} else {
				updateRoomEntry.Alerting = roomAlerting
				updateRoomEntry.UpdateTimes["alerting"] = time.Now()

			}
			updateRoom[room.Key] = updateRoomEntry
		}
	}

	// update the rooms
	for key, room := range updateRoom {
		log.L.Infof("Sending room %v for updates", key)

		log.L.Debugf("Room info: %v", room)

		_, _, err := cache.GetCache(config.DEFAULT).CheckAndStoreRoom(room)
		if err != nil {
			log.L.Errorf("Problem caching the power state for room %v: %v", room, err.Error())
		}
	}

	log.L.Debugf("Successfully updated room state.")

	return nil
}
