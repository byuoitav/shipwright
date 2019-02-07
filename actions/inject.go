package actions

import (
	"net/http"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/v2/events"
	"github.com/byuoitav/shipwright/state/cache"
	"github.com/labstack/echo"
)

// InjectEvent .
func (m *ActionManager) InjectEvent(ctx echo.Context) error {

	var e events.Event
	err := ctx.Bind(&e)
	if err != nil {
		return ctx.String(http.StatusBadRequest, err.Error())
	}

	log.L.Debugf("Got event %v", e)

	cache.GetCache("default").StoreAndForwardEvent(e)
	m.EventStream <- e

	return ctx.String(http.StatusOK, "ok")
}
