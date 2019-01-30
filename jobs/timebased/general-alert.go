package timebased

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/state/statedefinition"
	"github.com/byuoitav/shipwright/actions/action"
	"github.com/byuoitav/shipwright/config"
	"github.com/byuoitav/shipwright/elk"
	"github.com/byuoitav/shipwright/state/cache"
)

// GeneralAlertClearingJob .
type GeneralAlertClearingJob struct {
}

const (
	GeneralAlertClearing      = "general-alert-clearing"
	generalAlertClearingQuery = `{
	"_source": [
		"hostname"
	],
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "_type": "control-processor"
          }
        },
        {
          "match": {
            "alerts.lost-heartbeat.alerting": false
          }
        },
        {
          "match": {
            "alerting": true
          }
        }
      ]
    }
  },
  "size": 100
	}
	`
)

type generalAlertClearingQueryResponse struct {
	Hits struct {
		Total int `json:"total"`
		Hits  []struct {
			ID     string `json:"_id"`
			Source struct {
				Hostname string `json:"hostname"`
			} `json:"_source"`
		} `json:"hits"`
	} `json:"hits"`
}

// GetName .
func (g *GeneralAlertClearingJob) GetName() string {
	return GeneralAlertClearing
}

// Run runs the job
func (g *GeneralAlertClearingJob) Run(input config.JobInputContext, actionWrite chan action.Payload) {
	log.L.Debugf("Starting general-alert clearing job")

	// The query is constructed such that only elements that have a general alerting set to true, but no specific alersts return.
	body, err := elk.MakeELKRequest(http.MethodPost, fmt.Sprintf("/%s/_search", ""), []byte(generalAlertClearingQuery))
	if err != nil {
		log.L.Warn("failed to make elk request to run general alert clearing job: %s", err.String())
		return
	}

	var resp generalAlertClearingQueryResponse
	gerr := json.Unmarshal(body, &resp)
	if err != nil {
		log.L.Warn("couldn't unmarshal elk response to run general alert clearing job: %s", gerr)
		return
	}

	log.L.Debugf("[%s] Processing response data", "general-alert-clearing")

	F := false

	// go through and mark each of these rooms as not alerting, in the general
	for _, hit := range resp.Hits.Hits {
		log.L.Debugf("Marking general alerting on %s as false.", hit.ID)

		device := statedefinition.StaticDevice{Alerting: &F, DeviceID: hit.ID}
		device.UpdateTimes = make(map[string]time.Time)
		device.UpdateTimes["alerting"] = time.Now()

		cache.GetCache(config.DEFAULT).CheckAndStoreDevice(device)
	}

	log.L.Debugf("[%s] Finished general alert clearing job.", "general-alert-clearing")
}
