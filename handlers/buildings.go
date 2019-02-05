package handlers

import (
	"fmt"
	"net/http"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/structs"
	"github.com/byuoitav/shipwright/helpers"
	"github.com/labstack/echo"
)

// AddBuilding adds a building to the database
func AddBuilding(context echo.Context) error {
	log.L.Debugf("%s Starting AddBuilding...", helpers.BuildingsTag)

	// get information from the context
	buildingID := context.Param("building")

	var building structs.Building
	err := context.Bind(&building)
	if err != nil {
		msg := fmt.Sprintf("failed to bind request body for %s : %s", buildingID, err.Error())
		log.L.Errorf("%s %s", helpers.BuildingsTag, msg)
		return context.JSON(http.StatusBadRequest, err)
	}

	// call helper function
	result, ne := helpers.AddBuilding(buildingID, building)
	if ne != nil {
		log.L.Errorf("%s %s", helpers.BuildingsTag, ne.Error())
		return context.JSON(http.StatusInternalServerError, result)
	}

	log.L.Debugf("%s The building %s was successfully created!", helpers.BuildingsTag, buildingID)
	return context.JSON(http.StatusOK, result)
}

// AddMultipleBuildings adds a set of buildings to the database
func AddMultipleBuildings(context echo.Context) error {
	log.L.Debugf("%s Starting AddMultipleBuildings...", helpers.BuildingsTag)

	// get information from the context
	var buildings []structs.Building

	err := context.Bind(&buildings)
	if err != nil {
		msg := fmt.Sprintf("failed to bind request body for multiple buildings : %s", err.Error())
		log.L.Errorf("%s %s", helpers.BuildingsTag, msg)
		return context.JSON(http.StatusBadRequest, err)
	}

	var results []helpers.DBResponse
	// call helper function as we iterate
	for _, b := range buildings {
		res, ne := helpers.AddBuilding(b.ID, b)
		if ne != nil {
			log.L.Errorf("%s %s", helpers.BuildingsTag, ne.Error())
		}

		results = append(results, res)
	}

	log.L.Debugf("%s The buildings were successfully created!", helpers.BuildingsTag)
	return context.JSON(http.StatusOK, results)
}

// GetBuilding gets a building from the database based on the given ID
func GetBuilding(context echo.Context) error {
	log.L.Debugf("%s Starting GetBuilding...", helpers.BuildingsTag)
	// get information from the context
	buildingID := context.Param("building")

	building, err := helpers.GetBuilding(buildingID)
	if err != nil {
		msg := fmt.Sprintf("failed to get the building %s : %s", buildingID, err.Error())
		log.L.Errorf("%s %s", helpers.BuildingsTag, msg)
		return context.JSON(http.StatusInternalServerError, err)
	}

	log.L.Debugf("%s Successfully found the building %s!", helpers.BuildingsTag, buildingID)
	return context.JSON(http.StatusOK, building)
}

// GetAllBuildings gets all buildings from the database
func GetAllBuildings(context echo.Context) error {
	log.L.Debugf("%s Starting GetAllBuildings...", helpers.BuildingsTag)

	buildings, err := helpers.GetAllBuildings()
	if err != nil {
		msg := fmt.Sprintf("failed to get all buildings : %s", err.Error())
		log.L.Errorf("%s %s", helpers.BuildingsTag, msg)
		return context.JSON(http.StatusInternalServerError, err)
	}

	log.L.Debugf("%s Successfully got all buildings!", helpers.BuildingsTag)
	return context.JSON(http.StatusOK, buildings)
}

// UpdateBuilding updates a building in the database
func UpdateBuilding(context echo.Context) error {
	log.L.Debugf("%s Starting UpdateBuilding...", helpers.BuildingsTag)

	// get information from the context
	buildingID := context.Param("building")

	var building structs.Building
	err := context.Bind(&building)
	if err != nil {
		msg := fmt.Sprintf("failed to bind request body for %s : %s", buildingID, err.Error())
		log.L.Errorf("%s %s", helpers.BuildingsTag, msg)
		return context.JSON(http.StatusBadRequest, err)
	}
	log.L.Debugf("Building: %+v", building)
	// call helper function
	result, ne := helpers.UpdateBuilding(buildingID, building)
	if ne != nil {
		log.L.Errorf("%s %s", helpers.BuildingsTag, ne.Error())
		return context.JSON(http.StatusInternalServerError, result)
	}

	return context.JSON(http.StatusOK, result)
}

// UpdateMultipleBuildings updates a set of buildings in the database
func UpdateMultipleBuildings(context echo.Context) error {
	log.L.Debugf("%s Starting UpdateMultipleBuildings...", helpers.BuildingsTag)

	// get information from the context
	var buildings map[string]structs.Building

	err := context.Bind(&buildings)
	if err != nil {
		msg := fmt.Sprintf("failed to bind request body for multiple buildings : %s", err.Error())
		log.L.Errorf("%s %s", helpers.BuildingsTag, msg)
		return context.JSON(http.StatusBadRequest, err)
	}

	var results []helpers.DBResponse
	// call helper function as we iterate
	for id, building := range buildings {
		res, ne := helpers.UpdateBuilding(id, building)
		if ne != nil {
			log.L.Errorf("%s %s", helpers.BuildingsTag, ne.Error())
		}

		results = append(results, res)
	}

	log.L.Debugf("%s The buildings were successfully updated!", helpers.BuildingsTag)
	return context.JSON(http.StatusOK, results)
}

// DeleteBuilding deletes a building from the database based on the given ID
func DeleteBuilding(context echo.Context) error {
	log.L.Debugf("%s Starting DeleteBuilding...", helpers.BuildingsTag)

	// get information from the context
	buildingID := context.Param("building")

	// call helper function
	result, ne := helpers.DeleteBuilding(buildingID)
	if ne != nil {
		log.L.Errorf("%s %s", helpers.BuildingsTag, ne.Error())
		return context.JSON(http.StatusInternalServerError, result)
	}

	log.L.Debugf("%s The building %s was successfully deleted!", helpers.BuildingsTag, buildingID)
	return context.JSON(http.StatusOK, result)
}
