package helpers

import (
	"fmt"

	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/structs"
)

// DoUIConfigDatabaseAction performs various actions on the database
func DoUIConfigDatabaseAction(config structs.UIConfig, configID, username, action string) (DBResponse, *nerr.E) {
	// build response object
	response := DBResponse{
		ObjectID: configID,
		Action:   action,
		Success:  false,
	}

	// interact with the database
	switch action {
	case AddAction:
		config, err := db.GetDB().CreateUIConfig(configID, config)
		if err != nil {
			response.Error = fmt.Sprintf("failed to add the config %s to the database", configID)
			return response, nerr.Translate(err).Add(response.Error)
		}

		// record the change
		Master.AddedUIConfigs = append(Master.AddedUIConfigs, CreateUIConfigChange(config, action, username))

		response.Message = "UIConfig successfully created."
	case UpdateAction:
		config, err := db.GetDB().UpdateUIConfig(configID, config)
		if err != nil {
			response.Error = fmt.Sprintf("failed to update the config %s in the database", configID)
			return response, nerr.Translate(err).Add(response.Error)
		}

		// record the change
		Master.UpdatedUIConfigs = append(Master.UpdatedUIConfigs, CreateUIConfigChange(config, action, username))

		response.Message = "UIConfig successfully updated."

	case DeleteAction:
		err := db.GetDB().DeleteUIConfig(configID)
		if err != nil {
			response.Error = fmt.Sprintf("failed to delete the config %s from the database", configID)
			return response, nerr.Translate(err).Add(response.Error)
		}

		// record the change
		Master.DeletedUIConfigs = append(Master.DeletedUIConfigs, CreateUIConfigChange(config, action, username))

		response.Message = "UIConfig successfully deleted."
	}

	// return the response
	response.Success = true
	return response, nil
}

// AddUIConfig adds a uiconfig to the database
func AddUIConfig(configID string, config structs.UIConfig) (DBResponse, *nerr.E) {
	// build response object
	response := DBResponse{
		ObjectID: configID,
		Action:   AddAction,
		Success:  false,
	}

	config, err := db.GetDB().CreateUIConfig(configID, config)
	if err != nil {
		response.Error = fmt.Sprintf("failed to add the config %s to the database", configID)
		return response, nerr.Translate(err).Add(response.Error)
	}

	response.Message = "UIConfig successfully created."

	// return the response
	response.Success = true
	return response, nil
}

// UpdateUIConfig updates a uiconfig in the database
func UpdateUIConfig(configID string, config structs.UIConfig) (DBResponse, *nerr.E) {
	// build response object
	response := DBResponse{
		ObjectID: configID,
		Action:   UpdateAction,
		Success:  false,
	}

	config, err := db.GetDB().UpdateUIConfig(configID, config)
	if err != nil {
		response.Error = fmt.Sprintf("failed to update the config %s in the database", configID)
		return response, nerr.Translate(err).Add(response.Error)
	}

	response.Message = "UIConfig successfully updated."

	// return the response
	response.Success = true
	return response, nil
}

// GetUIConfig gets a uiconfig from the database
func GetUIConfig(configID string) (structs.UIConfig, *nerr.E) {
	config, err := db.GetDB().GetUIConfig(configID)
	if err != nil {
		return config, nerr.Translate(err).Addf("failed to get the config for %s", configID)
	}

	return config, nil
}

// GetAllUIConfigs gets all uiconfigs from the database
func GetAllUIConfigs() ([]structs.UIConfig, *nerr.E) {
	configs, err := db.GetDB().GetAllUIConfigs()
	if err != nil {
		return configs, nerr.Translate(err).Add("failed to get the all UI configs")
	}

	return configs, nil
}

// DeleteUIConfig deletes a uiconfig from the database
func DeleteUIConfig(configID string) (DBResponse, *nerr.E) {
	// build response object
	response := DBResponse{
		ObjectID: configID,
		Action:   DeleteAction,
		Success:  false,
	}

	err := db.GetDB().DeleteUIConfig(configID)
	if err != nil {
		response.Error = fmt.Sprintf("failed to delete the config %s from the database", configID)
		return response, nerr.Translate(err).Add(response.Error)
	}

	response.Message = "UIConfig successfully deleted."

	// return the response
	response.Success = true
	return response, nil
}
