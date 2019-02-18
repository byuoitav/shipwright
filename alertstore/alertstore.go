package alertstore

import (
	"context"
	"fmt"
	"time"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/structs"
	"github.com/byuoitav/shipwright/actions"
	"github.com/byuoitav/shipwright/actions/actionctx"
	"github.com/byuoitav/shipwright/alertstore/alertcache"
	"github.com/byuoitav/shipwright/alertstore/persist"
	"github.com/byuoitav/shipwright/socket"
)

type alertStore struct {
	inChannel         chan structs.Alert
	requestChannel    chan alertRequest
	resolutionChannel chan resolutionRequest

	store         map[string]structs.Alert
	actionManager *actions.ActionManager
}

//AlertRequest is submitted to the store to retrieve an alert from it.
type alertRequest struct {
	AlertID      string
	ResponseChan chan alertResponse
	All          bool
}

type resolutionRequest struct {
	Alerts         []string
	ResolutionInfo structs.ResolutionInfo
}

//AlertRepsonse should always have the error checked before retrieving the alert
type alertResponse struct {
	Error *nerr.E
	Alert []structs.Alert
}

var ZeroTime = time.Time{}

var store *alertStore

func InitializeAlertStore(a *actions.ActionManager) {
	store = &alertStore{
		inChannel:         make(chan structs.Alert, 1000),
		requestChannel:    make(chan alertRequest, 1000),
		resolutionChannel: make(chan resolutionRequest, 1000),
		store:             map[string]structs.Alert{},
		actionManager:     a,
	}

	go store.run()

	alerts, err := persist.GetAllActiveAlertsFromPersist()
	if err != nil {
		log.L.Errorf("Couldn't get all active alerts: %v", err.Error())
	}

	for i := range alerts {
		alerts[i].Source = Init
		alerts[i], err = AddRoomInformationToAlert(alerts[i])

		if err != nil {
			log.L.Warnf("Problem adding room info to alert %v", err.Error())
		}
		store.inChannel <- alerts[i]
	}

	log.L.Infof("Alert store initialized with %v alerts", len(alerts))
}

//PutAlert adds an alert to the store.
//Do we want to wait for confirmation?
func (a *alertStore) putAlert(alert structs.Alert) (string, *nerr.E) {
	//check to make sure we have a time
	if alert.AlertStartTime.IsZero() {
		alert.AlertStartTime = time.Now()
	}

	//Check to make sure we have an ID
	if alert.AlertID == "" {
		//we need to generate
		alert.AlertID = GenerateID(alert)
	}

	log.L.Infof("Adding alert %v for device %v", alert.AlertID, alert.DeviceID)

	a.inChannel <- alert
	return alert.AlertID, nil
}

func (a *alertStore) resolveAlertSet(resolutionInfo structs.ResolutionInfo, alertIDs ...string) *nerr.E {

	a.resolutionChannel <- resolutionRequest{
		Alerts:         alertIDs,
		ResolutionInfo: resolutionInfo,
	}

	return nil
}

func (a *alertStore) getAlert(id string) (structs.Alert, *nerr.E) {
	log.L.Infof("Getting alert %v", id)

	//make our request
	respChan := make(chan alertResponse, 1)

	a.requestChannel <- alertRequest{
		ResponseChan: respChan,
	}

	resp := <-respChan

	if len(resp.Alert) > 0 {
		return resp.Alert[0], resp.Error
	}

	return structs.Alert{}, resp.Error
}

func (a *alertStore) getAllAlerts() ([]structs.Alert, *nerr.E) {
	log.L.Infof("Getting all alerts")

	//make our request
	respChan := make(chan alertResponse, 1)

	a.requestChannel <- alertRequest{
		All:          true,
		ResponseChan: respChan,
	}

	resp := <-respChan

	return resp.Alert, resp.Error

}

func (a *alertStore) run() {
	log.L.Infof("running alert store")

	for {
		log.L.Debugf("Waiting for event")
		select {
		case al := <-a.inChannel:
			log.L.Debugf("Storing alert")
			a.storeAlert(al)
		case req := <-a.requestChannel:
			a.handleRequest(req)
		case req := <-a.resolutionChannel:
			a.resolveAlerts(req.ResolutionInfo, req.Alerts...)
		}
	}
}

//NOT SAFE FOR CONCURRENT ACCESS. DO NOT USE OUTSIDE OF run()
func (a *alertStore) resolveAlerts(resInfo structs.ResolutionInfo, alerts ...string) *nerr.E {

	log.L.Infof("Resolving alerts %v", alerts)

	//we remove it from the store, and ship it off to the persistance stuff.
	//we should check to see if it already exists
	toProcess := []structs.Alert{}

	for i := range alerts {
		log.L.Debugf("resolving alert %v", alerts[i])
		v, err := alertcache.GetAlertCache("default").GetAlert(alerts[i])
		if err == nil {

			err := alertcache.GetAlertCache("default").DeleteAlert(alerts[i])
			if err != nil {
				return err.Addf("couldn't resolve alert: %v", err.Error())
			}

			err = a.removeFromIndicies(v)
			if err != nil {
				return err.Addf("Problem removing alert from indicies: %v", err.Error())
			}

			//it's there, lets get it, mark it as resolved.
			v.Resolved = true
			v.ResolutionInfo = resInfo

			//submit for persistence
			persist.GetElkAlertPersist().StoreAlert(v, true, true)
			toProcess = append(toProcess, v)
			socket.GetManager().WriteToSockets(v)

		} else if err.Type == alertcache.NotFound {
			log.L.Errorf("%v", nerr.Create("Unkown alert "+alerts[i], "not-found"))
		} else {
			log.L.Errorf("%v", err.Addf("couldn't resolve alert"))
		}
	}

	//we postpone the running of actions until the end to guarentee all alerts resolved as a group are cleared out of the cache before running logic on them.

	if len(toProcess) > 0 {
		alerts, err := a.getAlertListByIndex(toProcess[0].RoomID)
		if err != nil {
			log.L.Errorf("Couldn't get alerts by index: %v", err.Error())
		}

		curSev := fmt.Sprintf("%v", toProcess[0].Severity)
		count := 0

		for i := range alerts {
			sev := ParseSeverityFromID(alerts[i])
			if curSev == sev {
				count++
			}
		}

		//check the list for rooms with the same severity.

		for i := range toProcess {
			toProcess[i].ResolutionInfo.ResolutionHash = fmt.Sprintf("%v/%v", toProcess[i].ResolutionInfo.ResolutionHash, count)
			a.runActions(toProcess[i])
		}
	}

	return nil
}

//NOT SAFE FOR CONCURRENT ACCESS. DO NOT USE OUTSIDE OF run()
func (a *alertStore) storeAlert(alert structs.Alert) {
	// log.L.Infof("Storing alert %v", alert.AlertID)
	if alert.Resolved {
		log.L.Errorf("Can't use storeAlert for resolved alerts: use resolveAlert")
		return
	}

	v, err := alertcache.GetAlertCache("default").GetAlert(alert.AlertID)
	//we should check to see if it already exists
	if err == nil {

		//check to see if our last update time is non-blank and before the one already in the cache, if so we don't do anything
		if !alert.AlertLastUpdateTime.IsZero() && alert.AlertLastUpdateTime.Before(v.AlertLastUpdateTime) {
			log.L.Infof("Alert: %v is out of date from cache.", alert.AlertID)
			//check if it's an init
			if alert.Source == Init {
				//create run the actions based on the alert in storage - since that's more up to date
				a.runInitActions(v)
			}
			return
		}

		if len(alert.Message) > 0 &&
			(len(v.MessageLog) == 0 || v.MessageLog[len(v.MessageLog)-1] != alert.Message) {

			v.MessageLog = append(v.MessageLog, alert.Message)
			v.Message = alert.Message
		}
		if len(alert.Notes) > 0 &&
			(len(v.NotesLog) == 0 || v.NotesLog[len(v.NotesLog)-1] != alert.Notes) {

			v.NotesLog = append(v.NotesLog, alert.Notes)
			v.Notes = alert.Notes
		}

		v.Active = alert.Active
		if !alert.Active && v.Active {
			if alert.AlertEndTime.IsZero() {
				v.AlertEndTime = time.Now()
			} else {
				v.AlertEndTime = alert.AlertEndTime
			}
		}

		v.AlertLastUpdateTime = time.Now()
		if alert.IncidentID != "" {
			v.IncidentID = alert.IncidentID
		}

		if alert.SystemType != "" {
			v.SystemType = alert.SystemType
		}

		if !alert.HelpSentAt.IsZero() {
			v.HelpSentAt = alert.HelpSentAt
		}
		if !alert.HelpArrivedAt.IsZero() {
			v.HelpArrivedAt = alert.HelpArrivedAt
		}
		if len(alert.Responders) > 0 {
			v.Responders = alert.Responders
		}
		if len(alert.DeviceTags) >= 0 {
			v.DeviceTags = alert.DeviceTags
		}
		if len(alert.RoomTags) >= 0 {
			v.RoomTags = alert.RoomTags
		}
		if len(alert.AlertTags) >= 0 {
			v.AlertTags = alert.AlertTags
		}

		err := alertcache.GetAlertCache("default").PutAlert(v)
		if err != nil {
			log.L.Errorf("Couldn't save alert %v: %v", alert.AlertID, err.Error())
			return
		}
		err = a.addToIndicies(v)
		if err != nil {
			log.L.Errorf("%v", err.Addf("Problem removing alert from indicies: %v", err.Error()))
			return
		}

		if alert.Source == Init {
			//create run the actions based on the alert in storage - since that's more up to date
			a.runInitActions(v)
		}

		alert = v

	} else if err.Type == alertcache.NotFound {

		//we store it.
		alert.AlertLastUpdateTime = time.Now()

		//set the start time
		if alert.AlertStartTime.IsZero() {
			alert.AlertStartTime = time.Now()
		}

		if len(alert.Message) > 0 {
			alert.MessageLog = append(v.MessageLog, alert.Message)
		}

		err := alertcache.GetAlertCache("default").PutAlert(alert)
		if err != nil {
			log.L.Errorf("%v", "Couldn't save alert %v: %v", alert.AlertID, err.Error())
			return
		}

		err = a.addToIndicies(alert)
		if err != nil {
			log.L.Errorf("%v", err.Addf("Problem removing alert from indicies: %v", err.Error()))
			return
		}

		if alert.Active {
			//run the iniitialization actions thing
			a.runInitActions(alert)
		}

	} else {
		log.L.Errorf("Error: %v", err.Error())
		return
	}

	//auto-resolution rule
	if !alert.Active && alert.HelpSentAt.IsZero() {

		log.L.Debugf("Autoresolving alert %v", alert.AlertID)
		resInfo := structs.ResolutionInfo{
			Code:       "Auto Resolved",
			Notes:      "Alert was auto resolved.",
			ResolvedAt: time.Now(),
		}

		err := a.resolveAlerts(resInfo, alert.AlertID)
		if err != nil {
			log.L.Errorf("Problem autoresolving alert %v: %v", alert.AlertID, err.Error())
		}

		return
	}

	persist.GetElkAlertPersist().StoreAlert(alert, false, false)
	a.runActions(alert)
	socket.GetManager().WriteToSockets(alert)
}

func (a *alertStore) runActions(alert structs.Alert) {
	if a.actionManager != nil {
		go func() {
			acts := actions.DefaultConfig().GetActionsByTrigger("alert-change")

			log.L.Debugf("Running %v alert change actions for alert %v", len(acts), alert.AlertID)

			// a new context for the run of this action
			actx := actionctx.PutAlert(context.Background(), alert)
			for i := range acts {
				a.actionManager.RunAction(actx, acts[i])
			}
		}()
	}
}

func (a *alertStore) runInitActions(alert structs.Alert) {
	if a.actionManager != nil {
		go func() {
			acts := actions.DefaultConfig().GetActionsByTrigger("alert-init")

			log.L.Debugf("Running %v alert init actions for alert %v", len(acts), alert.AlertID)

			// a new context for the run of this action
			actx := actionctx.PutAlert(context.Background(), alert)
			for i := range acts {
				a.actionManager.RunAction(actx, acts[i])
			}
		}()
	}
}

//NOT SAFE FOR CONCURRENT ACCESS. DO NOT USE OUTSIDE OF run()
func (a *alertStore) handleRequest(req alertRequest) {

	log.L.Infof("Handling request %+v", req)

	if req.All {
		toReturn, err := alertcache.GetAlertCache("default").GetAllAlerts()

		for i := range toReturn {
			toReturn[i].Source = Cache
		}

		req.ResponseChan <- alertResponse{
			Error: err,
			Alert: toReturn,
		}
	} else {
		v, err := alertcache.GetAlertCache("default").GetAlert(req.AlertID)
		v.Source = Cache

		req.ResponseChan <- alertResponse{
			Error: err,
			Alert: []structs.Alert{v},
		}
	}
}

func (a *alertStore) addToIndicies(alert structs.Alert) *nerr.E {
	//for now we only care about a 'room' index
	return alertcache.GetAlertCache("default").AddAlertToIndex(alert.RoomID, alert.AlertID)

}

func (a *alertStore) removeFromIndicies(alert structs.Alert) *nerr.E {
	//for now we only care about a 'room' index
	return alertcache.GetAlertCache("default").RemoveAlertFromIndex(alert.RoomID, alert.AlertID)
}

func (a *alertStore) getAlertListByIndex(indexID string) ([]string, *nerr.E) {
	return alertcache.GetAlertCache("default").GetAlertsByIndex(indexID)
}
