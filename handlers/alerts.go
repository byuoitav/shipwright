package handlers

import (
	"net/http"
	"sort"

	"github.com/byuoitav/common/servicenow"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/structs"
	"github.com/byuoitav/shipwright/alertstore"

	"github.com/labstack/echo"
)

// GetRoomIssue gets an individual room issue
func GetRoomIssue(context echo.Context) error {
	issueID := context.Param("issueID")
	if issueID == "" {
		return context.JSON(http.StatusBadRequest, "Invalid issue id")
	}

	alerts, err := alertstore.GetRoomIssue(issueID)
	if err != nil {
		return context.JSON(http.StatusInternalServerError, err)
	}

	return context.JSON(http.StatusOK, alerts)
}
func contains(s []string, e string) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}

// GetAllRoomIssues returns all alerts from the alert store
func GetAllRoomIssues(context echo.Context) error {
	alerts, err := alertstore.GetAllIssues()
	if err != nil {
		return context.JSON(http.StatusInternalServerError, err)
	}

	return context.JSON(http.StatusOK, alerts)
}

// ResolveIssue resolves an alert on the server side alert store
func ResolveIssue(context echo.Context) error {
	issueID := context.Param("issueID")

	var resolution structs.ResolutionInfo

	err := context.Bind(&resolution)
	if err != nil {
		log.L.Errorf("failed to bind resolution body from request: %s", err.Error())
		return context.JSON(http.StatusBadRequest, err)
	}

	ne := alertstore.ResolveIssue(resolution, issueID)
	if ne != nil {
		log.L.Errorf("failed to resolve issue: %s", ne.Error())
		return context.JSON(http.StatusBadRequest, ne)
	}

	return context.JSON(http.StatusOK, "ok")
}

// UpdateRoomIssue resolves an alert on the server side alert store
func UpdateRoomIssue(context echo.Context) error {

	var issue structs.RoomIssue

	err := context.Bind(&issue)
	if err != nil {
		log.L.Errorf("failed to bind resolution body from request: %s", err.Error())
		return context.JSON(http.StatusBadRequest, err)
	}

	ne := alertstore.UpdateRoomIssue(issue)
	if ne != nil {
		log.L.Errorf("failed to update issue: %s", ne.Error())
		return context.JSON(http.StatusBadRequest, ne)
	}

	return context.JSON(http.StatusOK, "ok")
}

// AddAlert adds an alert to the store
func AddAlert(context echo.Context) error {
	var a structs.Alert

	err := context.Bind(&a)
	if err != nil {
		log.L.Errorf("failed to bind resolution body from request: %s", err.Error())
		return context.JSON(http.StatusBadRequest, err)
	}

	id, ne := alertstore.AddAlert(a)
	if ne != nil {
		log.L.Errorf("failed to add alert: %s", ne.Error())
		return context.JSON(http.StatusInternalServerError, ne)
	}

	return context.JSON(http.StatusOK, id)
}

// GetClosureCodes gets the list of closure codes for ServiceNow
func GetClosureCodes(context echo.Context) error {
	codes, err := servicenow.GetResolutionActions()
	if err != nil {
		log.L.Errorf("failed to get closure codes: %s", err.Error())
		return context.JSON(http.StatusInternalServerError, err)
	}

	var actualCodes []string
	for _, code := range codes.Result {
		if !contains(actualCodes, code.UAction) {
			actualCodes = append(actualCodes, code.UAction)
		}
	}

	sort.Strings(actualCodes)

	return context.JSON(http.StatusOK, actualCodes)
}

// GetAlertStoreQueueStatus gets the queue status for the alert store
func GetAlertStoreQueueStatus(context echo.Context) error {
	status := alertstore.GetQueueStatus()

	return context.JSON(http.StatusOK, status)
}

// GetResponders returns the list of possible responders
func GetResponders(context echo.Context) error {
	var toReturn []structs.Person
	peopleNames := [5]string{"Caleb", "Baeleb", "Shmaeleb", "Kaleb", "Taylub"}
	peopleIDs := [5]string{"calebrulez4", "TheBest!", "Disrespected15", "DumbName6", "WhoAmI2"}
	for i := range peopleNames {
		var newPerson structs.Person
		newPerson.Name = peopleNames[i]
		newPerson.ID = peopleIDs[i]
		toReturn = append(toReturn, newPerson)
	}
	return context.JSON(http.StatusOK, toReturn)
}
