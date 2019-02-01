package store

import (
	"fmt"
	"time"

	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/structs"
)

type alertStore struct {
	InChannel      chan structs.Alert
	RequestChannel chan alertRequest

	store         map[string]structs.Alert
	configuration Config
}

//AlertRequest is submitted to the store to retrieve an alert from it.
type alertRequest struct {
	AlertID      string
	ResponseChan chan alertResponse
	All          bool
}

//AlertRepsonse should always have the error checked before retrieving the alert
type alertResponse struct {
	Error *nerr.E
	Alert []structs.Alert
}

const ZeroTime = time.Time{}

var store alertStore

func init() {
	store := AlertStore{
		InChannel:      make(chan structs.Alert, 1000),
		RequestChannel: make(chan alertRequest, 1000),
		store:          map[string]structs.Alert{},
	}

	go store.run()
}

//PutAlert adds an alert to the store.
//Do we want to wait for confirmation?
func (a *alertStore) putAlert(alert structs.Alert) (string, *nerr.E) {

	//check to make sure we have a time
	if a.StartTime.IsZero() {
		a.StartTime = time.Now()
	}

	//Check to make sure we have an ID
	if alert.AlertID == "" {
		//we need to generate
		a.AlertID = GenerateID(alert)
	}

	a.InChannel <- alert

	return alert.AlertID, nil
}

func (a *alertStore) getAlert(id string) (structs.Alert, *nerr.E) {

	//make our request
	respChan := make(chan alertResponse, 1)

	a.RequestChannel <- alertRequest{
		AlertID:      id,
		ResponseChan: respChan,
	}

	resp := <-respChan

	if len(resp.Alert) > 0 {
		return resp.Alert[0], resp.Error
	}

	return structs.Alert{}, resp.Error
}

func (a *alertStore) resolveAlert(alertID string, resInfo ResloutionInfo) *nerr.E {
	//we remove it from the store, and ship it off to the resolution configured

}

func (a *alertStore) run() {

	for {
		select {
		case a := <-a.InChannel:
			a.storeAlert(a)
		case req := <-a.RequestChannel:
			a.handleRequest(req)
		}
	}
}

//NOT SAFE FOR CONCURRENT ACCESS. DO NOT USE OUTSIDE OF run()
func (a *alertStore) storeAlert(alert structs.Alert) {

	//we should check to see if it already exists
	if v, ok := a.store[alert.AlertID]; ok {

		if len(alert.Message) > 0 &&
			(len(v.MessageLog) == 0 || v.MessageLog[len(v.MessageLog)-1] != alert.Message) {

			v.MessageLog = append(v.MessageLog, alert.Message)
			v.Message = alert.Message
		}

		v.Active = alert.Active
		v.AlertLastUpdateTime = time.Now()

		a.store[v.AlertID] = v //store it back in

	} else {

		//we store it.
		alert.AlertLastUpdateTime = time.Now()
		if len(alert.Message) > 0 {
			alert.MessageLog = append(v.MessageLog, alert.Message)
		}

		a.store[alert.AlertID] = alert
	}

	//submit to be updated in persistance.

	//check rules for actions
}

//NOT SAFE FOR CONCURRENT ACCESS. DO NOT USE OUTSIDE OF run()
func (a *alertStore) hanldeRequest(req alertRequest) {
	toReturn := []structs.Alert{}

	if req.All {
		for _, v := range a.store {
			toReturn = append(toReturn, v)
		}

	} else {
		if v, ok := a.store[req.AlertID]; ok {

			toReturn = append(toReturn, v)
			req.ResponseChan <- AlertResponse{
				Error:  nil,
				Alerts: toReturn,
			}
		} else {
			req.ResponseChan <- AlertResponse{
				Error:  nerr.Create(fmt.Sprintf("No Alert for id %v", req.AlertID), "not-found"),
				Alerts: toReturn,
			}
		}

	}

	req.ResponseChan <- AlertResponse{
		Error:  nil,
		Alerts: toReturn,
	}
}
