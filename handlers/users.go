package handlers

import (
	"fmt"
	"net/http"
	"net/url"

	"github.com/byuoitav/common/servicenow"

	"github.com/labstack/echo"
)

//GetUsers returns the list of users
func GetUsers(context echo.Context) error {
	var param string
	param = context.Param("param")
	param = url.QueryEscape(param)
	fmt.Println(param)
	users, err := servicenow.QueryAllUsers(param)
	if err != nil {
		return context.String(http.StatusInternalServerError, err.Error())
	}
	return context.JSON(http.StatusOK, users.Result)
}
func GetUserDetails(context echo.Context) error {
	var netId string
	netId = context.Param("netId")
	fmt.Printf("In the details call %s\n", netId)
	data, err := servicenow.GetAllUserInfo(netId)
	if err != nil {
		return context.String(http.StatusInternalServerError, err.Error())
	}
	return context.JSON(http.StatusOK, data)
}
