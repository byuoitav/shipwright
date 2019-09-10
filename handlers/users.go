package handlers

import (
	"net/http"

	"github.com/byuoitav/common/servicenow"

	"github.com/labstack/echo"
)

//GetUsers returns the list of users
func GetUsers(context echo.Context) error {
	users, err := servicenow.QueryAllUsers()
	if err != nil {
		return err
	}
	return context.JSON(http.StatusOK, users.Result)
}
