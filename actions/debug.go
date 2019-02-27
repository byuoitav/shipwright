package actions

import (
	"net/http"

	"github.com/labstack/echo"
)

// Info .
func (a *ActionManager) Info(ctx echo.Context) error {
	info := make(map[string]interface{})
	info["config"] = a.Config
	info["workers"] = a.Workers

	streamInfo := make(map[string]interface{})
	streamInfo["len"] = len(a.EventStream)
	streamInfo["cap"] = cap(a.EventStream)
	info["event-stream"] = streamInfo

	reqsInfo := make(map[string]interface{})
	reqsInfo["len"] = len(a.reqs)
	reqsInfo["cap"] = cap(a.reqs)
	info["action-reqs"] = reqsInfo

	a.managedActionsMu.RLock()
	defer a.managedActionsMu.RUnlock()

	info["managed"] = a.managedActions

	return ctx.JSON(http.StatusOK, info)
}

// ActionsByTrigger .
func (c *ActionConfig) ActionsByTrigger(ctx echo.Context) error {
	return ctx.JSON(http.StatusOK, c.GetActionsByTrigger(ctx.Param("trigger")))
}
