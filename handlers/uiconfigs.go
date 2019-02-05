package handlers

import (
	"fmt"
	"net/http"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/structs"
	"github.com/byuoitav/shipwright/helpers"
	"github.com/labstack/echo"
)

// AddUIConfig adds a UIConfig to the database
func AddUIConfig(context echo.Context) error {
	log.L.Debugf("%s Starting AddUIConfig...", helpers.UIConfigsTag)

	// get information from the context
	configID := context.Param("config")

	var config structs.UIConfig
	err := context.Bind(&config)
	if err != nil {
		msg := fmt.Sprintf("failed to bind request body for %s : %s", configID, err.Error())
		log.L.Errorf("%s %s", helpers.UIConfigsTag, msg)
		return context.JSON(http.StatusBadRequest, err)
	}

	// call helper function
	result, ne := helpers.AddUIConfig(configID, config)
	if ne != nil {
		log.L.Errorf("%s %s", helpers.UIConfigsTag, ne.Error())
		return context.JSON(http.StatusInternalServerError, result)
	}

	log.L.Debugf("%s The config %s was successfully created!", helpers.UIConfigsTag, configID)
	return context.JSON(http.StatusOK, result)
}

// AddMultipleUIConfigs adds a set of UIConfigs to the database
func AddMultipleUIConfigs(context echo.Context) error {
	log.L.Debugf("%s Starting AddMultipleUIConfigs...", helpers.UIConfigsTag)

	// get information from the context
	var configs []structs.UIConfig

	err := context.Bind(&configs)
	if err != nil {
		msg := fmt.Sprintf("failed to bind request body for multiple configs : %s", err.Error())
		log.L.Errorf("%s %s", helpers.UIConfigsTag, msg)
		return context.JSON(http.StatusBadRequest, err)
	}

	var results []helpers.DBResponse
	// call helper function as we iterate
	for _, c := range configs {
		res, ne := helpers.AddUIConfig(c.ID, c)
		if ne != nil {
			log.L.Errorf("%s %s", helpers.UIConfigsTag, ne.Error())
		}

		results = append(results, res)
	}

	log.L.Debugf("%s The configs were successfully created!", helpers.UIConfigsTag)
	return context.JSON(http.StatusOK, results)
}

// GetUIConfig gets a UIConfig from the database based on a given ID
func GetUIConfig(context echo.Context) error {
	log.L.Debugf("%s Starting GetUIConfig...", helpers.UIConfigsTag)
	// get information from the context
	configID := context.Param("config")

	config, err := helpers.GetUIConfig(configID)
	if err != nil {
		msg := fmt.Sprintf("failed to get the config %s : %s", configID, err.Error())
		log.L.Errorf("%s %s", helpers.UIConfigsTag, msg)
		return context.JSON(http.StatusInternalServerError, err)
	}

	log.L.Debugf("%s Successfully found the config %s!", helpers.UIConfigsTag, configID)
	return context.JSON(http.StatusOK, config)
}

// GetAllUIConfigs gets all UIConfigs from the database
func GetAllUIConfigs(context echo.Context) error {
	log.L.Debugf("%s Starting GetAllUIConfigs...", helpers.UIConfigsTag)

	configs, err := helpers.GetAllUIConfigs()
	if err != nil {
		msg := fmt.Sprintf("failed to get all configs : %s", err.Error())
		log.L.Errorf("%s %s", helpers.UIConfigsTag, msg)
		return context.JSON(http.StatusBadRequest, err)
	}

	log.L.Debugf("%s Successfully got all configs!", helpers.UIConfigsTag)
	return context.JSON(http.StatusOK, configs)
}

// UpdateUIConfig updates a UIConfig in the database
func UpdateUIConfig(context echo.Context) error {
	log.L.Debugf("%s Starting UpdateUIConfig...", helpers.UIConfigsTag)

	// get information from the context
	configID := context.Param("config")

	var config structs.UIConfig
	err := context.Bind(&config)
	if err != nil {
		msg := fmt.Sprintf("failed to bind request body for %s : %s", configID, err.Error())
		log.L.Errorf("%s %s", helpers.UIConfigsTag, msg)
		return context.JSON(http.StatusBadRequest, err)
	}

	// call helper function
	result, ne := helpers.UpdateUIConfig(configID, config)
	if ne != nil {
		log.L.Errorf("%s %s", helpers.UIConfigsTag, ne.Error())
		return context.JSON(http.StatusInternalServerError, result)
	}

	log.L.Debugf("%s The config %s was successfully updated!", helpers.UIConfigsTag, configID)
	return context.JSON(http.StatusOK, result)
}

// UpdateMultipleUIConfigs updates a set of UIConfigs in the database
func UpdateMultipleUIConfigs(context echo.Context) error {
	log.L.Debugf("%s Starting UpdateMultipleUIConfigs...", helpers.UIConfigsTag)

	// get information from the context
	var configs map[string]structs.UIConfig

	err := context.Bind(&configs)
	if err != nil {
		msg := fmt.Sprintf("failed to bind request body for multiple configs : %s", err.Error())
		log.L.Errorf("%s %s", helpers.UIConfigsTag, msg)
		return context.JSON(http.StatusBadRequest, err)
	}

	var results []helpers.DBResponse
	// call helper function as we iterate
	for id, config := range configs {
		res, ne := helpers.UpdateUIConfig(id, config)
		if ne != nil {
			log.L.Errorf("%s %s", helpers.UIConfigsTag, ne.Error())
		}

		results = append(results, res)
	}

	log.L.Debugf("%s The configs were successfully updated!", helpers.UIConfigsTag)
	return context.JSON(http.StatusOK, results)
}

// DeleteUIConfig deletes a UIConfig from the database based on a given ID
func DeleteUIConfig(context echo.Context) error {
	log.L.Debugf("%s Starting DeleteUIConfig...", helpers.UIConfigsTag)

	// get information from the context
	configID := context.Param("config")

	// call helper function
	result, ne := helpers.DeleteUIConfig(configID)
	if ne != nil {
		log.L.Errorf("%s %s", helpers.UIConfigsTag, ne.Error())
		return context.JSON(http.StatusInternalServerError, result)
	}

	log.L.Debugf("%s The config %s was successfully deleted!", helpers.UIConfigsTag, configID)
	return context.JSON(http.StatusOK, result)
}
