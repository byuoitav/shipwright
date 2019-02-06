package then

import (
	"context"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/servicenow"
	"github.com/byuoitav/shipwright/actions/actionctx"
	"github.com/byuoitav/shipwright/alertstore"
)

//would this need to return the incident? or what are we doing with it/where are we
//storing incident info?

//TODO: create only one then statement (if there is no incident number Then create incident)
//If there is an incident number and it is not resolved yet, then modify incident
//if there is an incident number AND it is resolved, then close the incident.
func CreateIncident(ctx context.Context, with []byte) *nerr.E {
	alert, ok := actionctx.GetAlert(ctx)
	if !ok {
		log.L.Errorf("Failed to get Alert")
		return nerr.Create("Must have alert to create incident", "")
	}

	//pass alert and call the create incident function is ServiceNow
	if len(alert.IncidentID) == 0 {
		if alert.Severity == "critical" {
			incident, err := servicenow.CreateIncident(alert)
			if err != nil {
				log.L.Errorf("Failed to create incident")
				return nerr.Translate(err).Add("Incident was not created in servicenow")
			}
			alert.IncidentID = incident.Number
		} else {
			repair, err := servicenow.CreateRepair(alert)
			if err != nil {
				log.L.Errorf("Failed to create repair")
				return nerr.Translate(err).Add("repair was not created in servicenow")
			}
			alert.IncidentID = repair.Number
		}

		alertstore.AddAlert(alert)
	}
	if len(alert.IncidentID) != 0 && alert.Resolved == false {
		if alert.Severity == "critical" {
			incident, err := servicenow.ModifyIncident(alert)
			if err != nil {
				log.L.Errorf("Failed to Modify incident")
				return nerr.Translate(err).Add("Incident was not modified in servicenow")
			}
		} else {
			repair, err := servicenow.ModifyRepair(alert)
			if err != nil {
				log.L.Errorf("Failed to Modify repair")
				return nerr.Translate(err).Add("repair was not modified in servicenow")
			}
		}

	}

	if len(alert.IncidentID) != 0 && alert.Resolved == true {
		if alert.Severity == "critical" {
			incident, err := servicenow.CloseIncident(alert)
			if err != nil {
				log.L.Errorf("Failed to close incident")
				return nerr.Translate(err).Add("Incident was not closed in servicenow")
			}
		} else {
			repair, err := servicenow.CloseRepair(alert)
			if err != nil {
				log.L.Errorf("Failed to close repair")
				return nerr.Translate(err).Add("Repair was not closed in servicenow")
			}
		}

	}
	return nil
}
