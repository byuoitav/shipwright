package handlers

import (
	"net/http"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/structs"
	"github.com/byuoitav/shipwright/alertstore"

	"github.com/labstack/echo"
)

// GetAllRoomIssues returns all alerts from the alert store
func GetAllRoomIssues(context echo.Context) error {
	alerts, err := alertstore.GetAllIssues()
	if err != nil {
		return context.JSON(http.StatusInternalServerError, err)
	}

	return context.JSON(http.StatusOK, alerts)
}

// ResolveAlert resolves an alert on the server side alert store
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
		log.L.Errorf("failed to resolve alert: %s", ne.Error())
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
