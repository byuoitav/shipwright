package alertstore

import (
	"context"
	"time"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/shipwright/actions"
	"github.com/byuoitav/shipwright/actions/actionctx"
	"github.com/byuoitav/shipwright/alertstore/alertcache"
	"github.com/byuoitav/shipwright/alertstore/persist"
	"github.com/byuoitav/shipwright/socket"
)

type alertStore struct {
	inChannel         chan structs.Alert
	issueEditChannel  chan structs.RoomIssue
	requestChannel    chan issueRequest
	resolutionChannel chan resolutionRequest

	actionManager *actions.ActionManager
}

//issueRequest is submitted to the store to retrieve an alert from it. You can get alerts by ID, RoomIssue or Room
type issueRequest struct {
	RoomIssueID  string
	ResponseChan chan issueResponse
	All          bool
}

type resolutionRequest struct {
	RoomIssue      string //resolve a room issue
	ResolutionInfo structs.ResolutionInfo
}

//issueResponse should always have the error checked before retrieving the alert
type issueResponse struct {
	Error      *nerr.E
	RoomIssues []structs.RoomIssue
	Alert      structs.Alert
}

var ZeroTime = time.Time{}

var store *alertStore

func InitializeAlertStore(a *actions.ActionManager) {
	store = &alertStore{
		inChannel:         make(chan structs.Alert, 1000),
		issueEditChannel:  make(chan structs.RoomIssue, 1000),
		requestChannel:    make(chan issueRequest, 1000),
		resolutionChannel: make(chan resolutionRequest, 1000),
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

func (a *alertStore) setRoomIssueInfo(issue structs.RoomInfo) *nerr.E {

	//we must have a room issue ID
	if issue.RoomIssueID == "" {
		return nerr.Create("unable to set the room issue info, must have an issue ID", "insufficient-info")
	}
	if issue.Resolved {
		return nerr.Create("Can't respolve using setRoomIssueInfo, use ResolveIssue", "invalid-args")
	}

	//otherwise we ship it in to be processed
	log.L.Infof("Editing the room issue info for %v", issue.RoomIssueID)

	a.issueEditChannel <- issue
	return nil
}

//putAlert adds an alert to the store.
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

func (a *alertStore) ResolveRoomIssue(resolutionInfo structs.ResolutionInfo, roomIssue string) *nerr.E {

	a.resolutionChannel <- resolutionRequest{
		RoomIssue:      roomIssue,
		ResolutionInfo: resolutionInfo,
	}

	return nil
}

func (a *alertStore) getAllIssues() ([]structs.RoomIssue, *nerr.E) {
	log.L.Infof("Getting all room issues")

	//make our request
	respChan := make(chan alertResponse, 1)

	a.requestChannel <- issueRequest{
		All:          true,
		ResponseChan: respChan,
	}

	resp := <-respChan

	return resp.RoomIssues, resp.Error

}

func (a *alertStore) run() {
	log.L.Infof("running alert store")

	for {
		log.L.Debugf("Waiting for event")
		select {
		case al := <-a.inChannel:
			log.L.Debugf("Storing alert")
			a.storeAlert(al)
		case is := <-a.issueEditChannel:
			log.L.Debugf("edit issue information")
			a.editIssueInformation(is)
		case req := <-a.requestChannel:
			a.handleRequest(req)
		case req := <-a.resolutionChannel:
			a.resolve(req.ResolutionInfo, req.RoomIssue)
		}
	}
}

//NOT SAFE FOR CONCURRENT ACCESS. DO NOT USE OUTSIDE OF run()
func (a *alertStore) editIssueInformation(issue structs.RoomIssue) *nerr.E {

	//check to see if it exists
	v, err := alertcache.GetAlertCache("default").GetIssue(issue.RoomIssueID)
	if err != nil {
		if err.Type == alertcache.NotFound {
			log.L.Errorf("Trying to edit room issue that doesn't exist: %v", issue.RoomIssueID)
			return
		} else {
			log.L.Errorf("Couldn't get room issue %v from cache %v", issue.RoomIssueID, err.Error())
		}
	}

	//v is our deal, we need to combine

	i, changes := combineIssues(issue, v)

	if changes {
		persist.GetElkAlertPersist().StoreIssue(i, false, false)
		alertcache.GetAlertCache("default").PutIssue(i)
	}
}

//NOT SAFE FOR CONCURRENT ACCESS. DO NOT USE OUTSIDE OF run()
func (a *alertStore) resolveIssue(resInfo structs.ResolutionInfo, roomIssue string) *nerr.E {

	log.L.Infof("Resolving issue %v", roomIssue)

	//we remove it from the store, and ship it off to the persistance stuff.
	//we should check to see if it already exists

	log.L.Debugf("resolving issue %v", roomIssue)
	v, err := alertcache.GetAlertCache("default").GetIssue(alerts[i])
	if err == nil {

		err := alertcache.GetAlertCache("default").DeleteIssue(alerts[i])
		if err != nil {
			return err.Addf("couldn't resolve issue: %v", err.Error())
		}

		//it's there, lets get it, mark it as resolved.
		v.Resolved = true
		v.ResolutionInfo = resInfo

		//submit for persistence
		persist.GetElkAlertPersist().StoreIssue(v, true, true)
		socket.GetManager().WriteToSockets(v)

	} else if err.Type == alertcache.NotFound {
		log.L.Errorf("%v", nerr.Create("Unkown room issue "+roomIssue, "not-found"))
	} else {
		log.L.Errorf("%v", err.Addf("couldn't resolve room issue"))
	}

	a.runIssueActions(v)

	return nil
}

//NOT SAFE FOR CONCURRENT ACCESS. DO NOT USE OUTSIDE OF run()
func (a *alertStore) storeAlert(alert structs.Alert) {
	log.L.Infof("Storing alert %v", alert.AlertID)

	//get the issue associated with the alert
	issueID := GetIssueIDFromAlertID(alert.AlertID)

	//we should check to see if the room already has an issue associated with it.
	issue, err := alertcache.GetAlertCache("default").GetIssue(alert.issueID)
	if err == nil {
		//we need to check to see if this alert exists on the issuecheck to see if this alert exists on the issue
		v, ok := v.Alerts[alert.AlertID]
		if ok {
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

			v.Active = alert.Active
			if !alert.Active && v.Active {
				if alert.AlertEndTime.IsZero() {
					v.AlertEndTime = time.Now()
				} else {
					v.AlertEndTime = alert.AlertEndTime
				}
			}

			v.AlertLastUpdateTime = time.Now()

			if alert.SystemType != "" {
				v.SystemType = alert.SystemType
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

			if alert.Source == Init {
				//create run the actions based on the alert in storage - since that's more up to date
				a.runInitActions(v)
			}

			alert = v
		} else {

			//we store it.
			alert.AlertLastUpdateTime = time.Now()

			//set the start time
			if alert.AlertStartTime.IsZero() {
				alert.AlertStartTime = time.Now()
			}

			if len(alert.Message) > 0 {
				alert.MessageLog = append(v.MessageLog, alert.Message)
			}

			if alert.Active {
				//run the iniitialization actions thing
				a.runInitActions(alert)
			}

		}

		//add/update the alert in the issue
		issue.Alerts[alert.AlertID] = alert
		issue.CalculateTypeCategories()

	} else if err.Type == alertcache.NotFound {

		//generate the new roomIssue.
		alert.AlertLastUpdateTime = time.Now()

		//set the start time
		if alert.AlertStartTime.IsZero() {
			alert.AlertStartTime = time.Now()
		}

		if len(alert.Message) > 0 {
			alert.MessageLog = append(v.MessageLog, alert.Message)
		}

		if alert.Active {
			//run the iniitialization actions thing
			a.runInitActions(alert)
		}

		if alert.Active {
			//run the iniitialization actions thing
			a.runInitActions(alert)
		}

		issue = structs.RoomIssue{
			RoomIssueID:     GetIssueIDFromAlertID(alert.AlertID),
			BasicRoomInfo:   alert.BasicDeviceInfo.BasicRoomInfo,
			Severity:        alert.Severity,
			RoomTags:        alert.RoomTags,
			AlertTypes:      []AlertTypes{issue.Type},
			AlertCategories: []AlertCategories{issue.Category},
		}

	} else {
		log.L.Errorf("Error: %v", err.Error())
		return
	}

	err := alertcache.GetAlertCache("default").PutIssue(issue)
	if err != nil {
		log.L.Errorf("%v", "Couldn't save issue %v: %v", issue.RoomIssueID, err.Error())
		return
	}

	active := false
	for _, v := range issue.Alerts {
		if v.Active {
			active = true
			break
		}
	}

	//auto-resolution rule
	if !active {

		log.L.Debugf("Autoresolving Issue %v", issue.RoomIssueID)
		resInfo := structs.ResolutionInfo{
			Code:       "Auto Resolved",
			Notes:      "issue was auto resolved.",
			ResolvedAt: time.Now(),
		}

		err := a.resolveIssue(resInfo, issue.RoomIssueID)
		if err != nil {
			log.L.Errorf("Problem autoresolving issue %v: %v", issue.RoomIssueID, err.Error())
		}

		return
	}

	persist.GetElkAlertPersist().StoreIssue(issue, false, false)
	a.runIssueActions(issue)
	socket.GetManager().WriteToSockets(alert)
}

func (a *alertStore) runIssueActions(issue structs.RoomIssue) {
	if a.actionManager != nil {
		go func() {
			acts := actions.DefaultConfig().GetActionsByTrigger("issue-change")

			log.L.Debugf("Running %v alert change actions for issue %v", len(acts), alert.AlertID)

			// a new context for the run of this action
			actx := actionctx.PutRoomIssue(context.Background(), issue)
			for i := range acts {
				a.actionManager.RunAction(actx, acts[i])
			}
		}()
	}
}

func (a *alertStore) runAlertInitActions(alert structs.Alert) {
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
func (a *alertStore) handleRequest(req issueRequest) {

	log.L.Infof("Handling request %+v", req)

	if req.All {
		toReturn, err := alertcache.GetAlertCache("default").GetAllAlerts()

		for i := range toReturn {
			toReturn[i].Source = Cache
		}

		req.ResponseChan <- issueResponse{
			Error: err,
			Alert: toReturn,
		}

	} else {
		v, err := alertcache.GetAlertCache("default").GetIssue(req.RoomIssueID)
		v.Source = Cache

		req.ResponseChan <- issueResponse{
			Error:      err,
			RoomIssues: []structs.RoomIssue{v},
		}
	}

}

func combineIssues(n, o structs.RoomIssue) (structs.RoomIssue, changes) {
	changes := false

	if len(n.IssueTags) != len(o.IssueTags) || !structs.ContainsAllTags(n.IssueTags, o.IssueTags) {
		o.IssueTags = n.IssueTags
		changes = true
	}

	if len(n.IncidentID) > 0 && n.IncidentID != o.IncidentID {
		o.IncidentID = n.IncidentID
		changes = true
	}

	if len(n.Notes) > 0 && n.Notes != o.Notes {
		o.NotesLog = append(o.NotesLog, n.Notes)
		o.Notes = n.Notes
		changes = true
	}

	if len(n.Responders) > 0 && len(n.Responders) != len(o.Responders) && structs.ContainsAllTags(o.Responders, n.Responders) {
		o.Responders = n.Responders
		changes = true
	}

	if !n.HelpSentAt.IsZero() && !n.HelpSentAt.Equals(o.HelpSentAt) {
		o.HelpSentAt = n.HelpSentAt
		changes = true
	}

	if !n.HelpArrivedAt.IsZero() && !n.HelpArrivedAt.Equals(o.HelpArrivedAt) {
		o.HelpArrivedAt = n.HelpArrivedAt
		changes = true
	}

	return structs.RoomIssue{}
}
