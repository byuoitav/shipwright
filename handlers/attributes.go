package handlers

import (
	"net/http"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/shipwright/helpers"
	"github.com/labstack/echo"
)

// GetAttributeGroup gets one attribute set from the database based on the given ID
func GetAttributeGroup(context echo.Context) error {
	groupID := context.Param("groupID")

	group, err := helpers.GetAttributeGroup(groupID)
	if err != nil {
		log.L.Errorf("failed to get an attribute set: %s", err.String())
		return context.JSON(http.StatusInternalServerError, err)
	}

	return context.JSON(http.StatusOK, group)
}

// GetAllAttributeGroups gets all of the attribute sets from the database
func GetAllAttributeGroups(context echo.Context) error {
	groups, err := helpers.GetAllAttributeGroups()
	if err != nil {
		log.L.Errorf("failed to get all attribute sets: %s", err.String())
		return context.JSON(http.StatusInternalServerError, err)
	}

	return context.JSON(http.StatusOK, groups)
}
