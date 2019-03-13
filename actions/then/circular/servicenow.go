package circular

import (
	"context"
	"fmt"
	"strings"

	"github.com/byuoitav/common/servicenow"
	"github.com/labstack/gommon/log"

	"github.com/byuoitav/shipwright/alertstore"
	"go.uber.org/zap"

	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/structs"
	"github.com/byuoitav/shipwright/actions/actionctx"
)

//SyncRoomIssueWithServiceNow will sync the RoomIssue with an ticket (incident or repair)
func SyncRoomIssueWithServiceNow(ctx context.Context, with []byte, log *zap.SugaredLogger) (err *nerr.E) {
	//get the RoomIssue from the context
	roomIssue, ok := actionctx.GetRoomIssue(ctx)

	if !ok {
		log.Errorf("Failed to get RoomIssue")
		return nerr.Create("Must have RoomIssue to create ticket", "")
	}

	//The business logic is this:
	//If there are any Critical Alerts, then an INC ticket should be created or updated
	//If there are any Warning Alerts, then an RPR ticket should be created or updated

	//We know to create or update based on the presence of the incident/repair ID on the
	//room issue in the incidentID array

	//Messages go onto the tickets only from the applicable alerts (those with matching severity)

	//Notes from the room issue go on both tickets

	//Room Issue Resolution information applies to both tickets
	//If If the room issue is partially resolved, a new room issue is created with the appropriate
	//Incident ID, so once it gets to this point, it is the same

	//determine if we have any critical alerts
	var criticalAlerts []structs.Alert
	var warningAlerts []structs.Alert
	for _, alert := range roomIssue.Alerts {
		if alert.Severity == structs.Critical {
			criticalAlerts = append(criticalAlerts, alert)
			continue
		} else if alert.Severity == structs.Warning {
			warningAlerts = append(warningAlerts, alert)
			continue
		}
	}

	if len(criticalAlerts) > 0 {
		cricitalIncidentID := ""

		//see if we already have an incident to sync with
		for _, incidentID := range roomIssue.IncidentID {
			if strings.Contains(incidentID, "INC") {
				cricitalIncidentID = incidentID
				break
			}
		}

		//go ahead and sync
		newIncidentID, err := syncRoomIssueWithIncident(roomIssue, cricitalIncidentID, criticalAlerts)

		if err != nil {
			log.Errorf("Unable to sync room issue with incident")
			return err
		}

		if newIncidentID != cricitalIncidentID {
			roomIssue.IncidentID = append(roomIssue.IncidentID, cricitalIncidentID)
			roomIssueError := alertstore.UpdateRoomIssue(roomIssue)

			if roomIssueError != nil {
				log.Errorf("Unable to update Room Issue in persistence store")
				return nerr.Translate(roomIssueError)
			}
		}

	}
	if len(warningAlerts) > 0 {
		warningIncidentID := ""

		//see if we already have an incident to sync with
		for _, incidentID := range roomIssue.IncidentID {
			if strings.Contains(incidentID, "RPR") {
				warningIncidentID = incidentID
				break
			}
		}

		//go ahead and sync
		newIncidentID, err := syncRoomIssueWithRepair(roomIssue, warningIncidentID, warningAlerts)

		if err != nil {
			log.Errorf("Unable to sync room issue with repair")
			return err
		}

		if newIncidentID != warningIncidentID {
			roomIssue.IncidentID = append(roomIssue.IncidentID, warningIncidentID)
			roomIssueError := alertstore.UpdateRoomIssue(roomIssue)

			if roomIssueError != nil {
				log.Errorf("Unable to update Room Issue in persistence store")
				return nerr.Translate(roomIssueError)
			}
		}

	}

	return nil
}

func syncRoomIssueWithRepair(roomIssue structs.RoomIssue, repairID string, criticalAlerts []structs.Alert) (string, *nerr.E) {
	var existingRepair structs.RepairResponse
	var err error

	if len(incidentID) == 0 {
		//see if there is already one in service now
		existingRepairs, err := servicenow.QueryRepairsByRoom(roomIssue.RoomID)
		if err != nil {
			log.Errorf("Unable to check for existing incident")
			return "", nerr.Translate(err)
		}

		if len(existingRepairs) > 0 {
			existingRepair = existingRepairs[0]
		}
	} else {
		existingRepair, err = servicenow.GetIncident(repairID)
		if err != nil {
			log.Errorf("Unable to retrieve existing incident")
			return "", nerr.Translate(err)
		}
	}

	alertTypes := []structs.AlertType{}
	for _, alert := range warningAlerts {
		exists := false
		for _, alertType := range alertTypes {
			if alertType == alert.Type {
				exists = true
				break
			}
		}

		if !exists {
			alertTypes = append(alertTypes, alert.Type)
		}
	}

	shortDescription := fmt.Sprintf("%s is alerting with %v Alerts of type %s.", roomIssue.RoomID, len(criticalAlerts), alertTypes)

	internalNotes := ""

	for _, roomResponse := range roomIssue.RoomIssueResponses {
		if roomResponse.HelpSentAt.IsZero() == false {
			responderString := ""
			for _, responder := range roomResponse.Responders {
				responderString += responder.Name
			}
			s := fmt.Sprintf("\nDispatch %s: %s\n", responderString, roomResponse.HelpSentAt.Format("01/02/2006 3:04 PM"))

			if !strings.Contains(existingIncident.InternalNotes, s) {
				internalNotes += s
			}
		}

		if roomResponse.HelpArrivedAt.IsZero() == false {
			s := fmt.Sprintf("\nArrived at: %s\n", roomResponse.HelpArrivedAt.Format("01/02/2006 3:04 PM"))

			if !strings.Contains(existingIncident.InternalNotes, s) {
				internalNotes += s
			}
		}
	}

	if len(roomIssue.Notes) > 0 {
		if !strings.Contains(existingIncident.InternalNotes, roomIssue.Notes) {
			internalNotes += "\n--------Room Notes-------\n"
			internalNotes += roomIssue.Notes + "\n"
		}
	}

	for _, alert := range criticalAlerts {
		if len(alert.Message) > 0 {
			if !strings.Contains(existingIncident.InternalNotes, alert.Message) {
				internalNotes += fmt.Sprintf("\n--------%s Notes-------\n", alert.DeviceID)
				internalNotes += alert.Message + "\n"
			}
		}
	}

	internalNotes = strings.TrimSpace(internalNotes)

	workLog := ""
	resolutionClosureCode := ""
	resolutionService := ""
	resolutionAction := ""

	if roomIssue.Resolved {
		workLog += "\n-------Resolution Info-------\n"
		workLog += roomIssue.ResolutionInfo.Code + "\n"
		workLog += roomIssue.ResolutionInfo.Notes + "\n"

		resolutionClosureCode = servicenow.IncidentClosureCode
		resolutionService = servicenow.IncidentResolutionService
		resolutionAction = roomIssue.ResolutionInfo.Code
	}

	workLog = strings.TrimSpace(workLog)
	for _, alert := range warningAlerts {
		if len(alert.Requester) > 0 {
			requester = alert.Requester
		}
	}

	if len(requester) == 0 {
		requester = servicenow.IncidentDefaultRequestor
	}

	input := structs.RepairRequest{
		Service:  serviceNow.RepairService,
		Building: RoomIssue.BuildingID,
		Room:     roomIDreplaced,

		AssignmentGroup:  serviceNow.RepairAssignmentGroup,
		ShortDescription: shortDescription,
		InternalNotes:    internalNotes,
		WorkLog:          workLog,

		RequestOriginator:  requester,
		RequestDate:        requestdate,
		DateNeeded:         serviceNow.RepairDateNeeded,
		RequestOrigination: serviceNow.RepairRequestOrigination,
		EquipmentReturn:    serviceNow.RepairEquipmentReturn,
	}

	if roomIssue.Resolved {
		input.State = repairClosedState
	}

	if len(existingRepair.Number) > 0 {
		//modify
		updatedIncident, err := servicenow.ModifyIncident(input, existingIncident.SysID)

		if err != nil {
			log.Errorf("Unable to modify incident: %v", err.Error())
			return "", nerr.Translate(err)
		}

		return updatedIncident.Number, nil
	} else {
		//create
		newIncident, err := servicenow.CreateIncident(input)

		if err != nil {
			log.Errorf("Unable to create incident: %v", err.Error())
			return "", nerr.Translate(err)
		}

		return newIncident.Number, nil
	}
}

func syncRoomIssueWithIncident(roomIssue structs.RoomIssue, incidentID string, criticalAlerts []structs.Alert) (string, *nerr.E) {
	var existingIncident structs.IncidentResponse
	var err error

	if len(incidentID) == 0 {
		//see if there is already one in service now
		existingIncidents, err := servicenow.QueryIncidentsByRoom(roomIssue.RoomID)
		if err != nil {
			log.Errorf("Unable to check for existing incident")
			return "", nerr.Translate(err)
		}

		if len(existingIncidents) > 0 {
			existingIncident = existingIncidents[0]
		}
	} else {
		existingIncident, err = servicenow.GetIncident(incidentID)
		if err != nil {
			log.Errorf("Unable to retrieve existing incident")
			return "", nerr.Translate(err)
		}
	}

	alertTypes := []structs.AlertType{}
	for _, alert := range criticalAlerts {
		exists := false
		for _, alertType := range alertTypes {
			if alertType == alert.Type {
				exists = true
				break
			}
		}

		if !exists {
			alertTypes = append(alertTypes, alert.Type)
		}
	}

	shortDescription := fmt.Sprintf("%s is alerting with %v Alerts of type %s.", roomIssue.RoomID, len(criticalAlerts), alertTypes)

	internalNotes := ""

	for _, roomResponse := range roomIssue.RoomIssueResponses {
		if roomResponse.HelpSentAt.IsZero() == false {
			responderString := ""
			for _, responder := range roomResponse.Responders {
				responderString += responder.Name
			}
			s := fmt.Sprintf("\nDispatch %s: %s\n", responderString, roomResponse.HelpSentAt.Format("01/02/2006 3:04 PM"))

			if !strings.Contains(existingIncident.InternalNotes, s) {
				internalNotes += s
			}
		}

		if roomResponse.HelpArrivedAt.IsZero() == false {
			s := fmt.Sprintf("\nArrived at: %s\n", roomResponse.HelpArrivedAt.Format("01/02/2006 3:04 PM"))

			if !strings.Contains(existingIncident.InternalNotes, s) {
				internalNotes += s
			}
		}
	}

	if len(roomIssue.Notes) > 0 {
		if !strings.Contains(existingIncident.InternalNotes, roomIssue.Notes) {
			internalNotes += "\n--------Room Notes-------\n"
			internalNotes += roomIssue.Notes + "\n"
		}
	}

	for _, alert := range criticalAlerts {
		if len(alert.Message) > 0 {
			if !strings.Contains(existingIncident.InternalNotes, alert.Message) {
				internalNotes += fmt.Sprintf("\n--------%s Notes-------\n", alert.DeviceID)
				internalNotes += alert.Message + "\n"
			}
		}
	}

	internalNotes = strings.TrimSpace(internalNotes)

	workLog := ""
	resolutionClosureCode := ""
	resolutionService := ""
	resolutionAction := ""

	if roomIssue.Resolved {
		workLog += "\n-------Resolution Info-------\n"
		workLog += roomIssue.ResolutionInfo.Code + "\n"
		workLog += roomIssue.ResolutionInfo.Notes + "\n"

		resolutionClosureCode = servicenow.IncidentClosureCode
		resolutionService = servicenow.IncidentResolutionService
		resolutionAction = roomIssue.ResolutionInfo.Code
	}

	workLog = strings.TrimSpace(workLog)

	roomIDreplaced := strings.Replace(roomIssue.RoomID, "-", " ", -1)

	requester := ""

	for _, alert := range criticalAlerts {
		if len(alert.Requester) > 0 {
			requester = alert.Requester
		}
	}

	if len(requester) == 0 {
		requester = servicenow.IncidentDefaultRequestor
	}

	input := structs.IncidentRequest{
		Service:       servicenow.IncidentService,
		CallerID:      requester,
		ContactNumber: servicenow.IncidentDefaultContactNumber,

		AssignmentGroup: servicenow.IncidentAssignmentGroup,
		Room:            roomIDreplaced,

		ShortDescription: shortDescription,

		Severity:    servicenow.IncidentSeverity,
		Reach:       servicenow.IncidentReach,
		WorkStatus:  servicenow.IncidentWorkStatus,
		Sensitivity: servicenow.IncidentSensitivity,

		InternalNotes: internalNotes,
		WorkLog:       workLog,

		ClosureCode:       resolutionClosureCode,
		ResolutionService: resolutionService,
		ResolutionAction:  resolutionAction,
	}

	if len(existingIncident.Number) > 0 {
		//modify
		updatedIncident, err := servicenow.ModifyIncident(input, existingIncident.SysID)

		if err != nil {
			log.Errorf("Unable to modify incident: %v", err.Error())
			return "", nerr.Translate(err)
		}

		return updatedIncident.Number, nil
	} else {
		//create
		newIncident, err := servicenow.CreateIncident(input)

		if err != nil {
			log.Errorf("Unable to create incident: %v", err.Error())
			return "", nerr.Translate(err)
		}

		return newIncident.Number, nil
	}
}
