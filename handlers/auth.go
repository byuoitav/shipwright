package handlers

import (
	"net/http"

	"github.com/labstack/echo"
)

// GetUsername is the handler for the endpoint to get a username
func GetUsername(context echo.Context) error {
	return context.JSON(http.StatusOK, getUsernameString(context))
}

// getUsernameString is not a handler for an endpoint, but a function for other handlers to use to get the username as a string
func getUsernameString(context echo.Context) string {
	username := context.Request().Context().Value("user")

	if username == nil || len(username.(string)) == 0 {
		username = "Derek"
	}

	return username.(string)
}

// GetUserPermissions returns a list of the current user's permissions
func GetUserPermissions(context echo.Context) error {
	// TODO figure out how to do this... haha
	return context.JSON(http.StatusOK, nil)
}
