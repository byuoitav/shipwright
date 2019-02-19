package circular

import (
	"context"

	"github.com/byuoitav/common/nerr"
)

func CreateIncidentRepair(ctx context.Context, with []byte) (id string, err *nerr.E) {
	/*
		alert, ok := actionctx.GetAlert(ctx)
		if !ok {
			log.L.Errorf("Failed to get Alert")
			return "", nerr.Create("Must have alert to create incident", "")
		}

		//pass alert and call the create incident function is ServiceNow
		if len(alert.IncidentID) == 0 {
			if alert.Severity == "critical" {
				incident, err := servicenow.CreateIncident(alert)
				if err != nil {
					log.L.Errorf("Failed to create incident")
					return "", nerr.Translate(err).Add("Incident was not created in servicenow")
				}
				alert.IncidentID = incident.Number
				alertstore.AddAlert(alert)
				log.L.Infof("ticket number: %s", incident.Number)
				return incident.Number, nil
			} else {
				repair, err := servicenow.CreateRepair(alert)
				if err != nil {
					log.L.Errorf("Failed to create repair")
					return "", nerr.Translate(err).Add("repair was not created in servicenow")
				}
				alert.IncidentID = repair.Number
				alertstore.AddAlert(alert)
				log.L.Infof("ticket number: %s", repair.Number)
				return repair.Number, nil
			}

		}

		if len(alert.IncidentID) != 0 && alert.Resolved == false {
			if alert.Severity == "critical" {
				incident, err := servicenow.ModifyIncident(alert)
				if err != nil {
					log.L.Errorf("Failed to Modify incident")
					return "", nerr.Translate(err).Add("Incident was not modified in servicenow")
				}
				log.L.Infof("ticket number: %s", incident.Number)
				return incident.Number, nil
			} else {
				repair, err := servicenow.ModifyRepair(alert)
				if err != nil {
					log.L.Errorf("Failed to Modify repair")
					return "", nerr.Translate(err).Add("repair was not modified in servicenow")
				}
				log.L.Infof("ticket number: %s", repair.Number)
				return repair.Number, nil
			}
		}

		if len(alert.IncidentID) != 0 && alert.Resolved == true {
			if alert.Severity == "critical" {
				incident, err := servicenow.CloseIncident(alert)
				if err != nil {
					log.L.Errorf("Failed to close incident")
					return "", nerr.Translate(err).Add("Incident was not closed in servicenow")
				}
				log.L.Infof("ticket number: %s", incident.Number)
				return incident.Number, nil
			} else {
				repair, err := servicenow.CloseRepair(alert)
				if err != nil {
					log.L.Errorf("Failed to close repair")
					return "", nerr.Translate(err).Add("Repair was not closed in servicenow")
				}
				log.L.Infof("ticket number: %s", repair.Number)
				return repair.Number, nil
			}
		}
		return "", nil
	*/
	return "", nil
}
