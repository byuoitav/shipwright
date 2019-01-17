package handlers

import (
	"fmt"
	"net/http"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/shipwright/helpers"
	"github.com/labstack/echo"
)

// GetIcons gets a list of possible icons to use
func GetIcons(context echo.Context) error {
	log.L.Debugf("%s Starting GetIcons...", helpers.OptionsTag)

	iconList, err := helpers.GetIcons()
	if err != nil {
		msg := fmt.Sprintf("failed to get icons from the database : %s", err.Error())
		log.L.Errorf("%s %s", helpers.OptionsTag, msg)
		return context.JSON(http.StatusInternalServerError, err)
	}

	log.L.Debugf("%s Successfully got the icons from the database!", helpers.OptionsTag)
	return context.JSON(http.StatusOK, iconList)
}

// GetTemplates gets a list of possible templates to use
func GetTemplates(context echo.Context) error {
	log.L.Debugf("%s Starting GetTemplates...", helpers.OptionsTag)

	templateList, err := helpers.GetTemplates()
	if err != nil {
		msg := fmt.Sprintf("failed to get templates from the database : %s", err.Error())
		log.L.Errorf("%s %s", helpers.OptionsTag, msg)
		return context.JSON(http.StatusInternalServerError, err)
	}

	log.L.Debugf("%s Successfully got the templates from the database!", helpers.OptionsTag)
	return context.JSON(http.StatusOK, templateList)
}
