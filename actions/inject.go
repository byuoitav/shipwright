package actions

import (
	"net/http"

	"github.com/labstack/echo"
)

// InjectEvent .
func (m *ActionManager) InjectEvent(ctx echo.Context) error {
	return ctx.String(http.StatusOK, "ok")
}
