package handlers

import (
	"net/http"

	"github.com/byuoitav/shipwright/helpers"
	"github.com/labstack/echo"
)

// GetAddedBuildings returns the information about the buildings that have been added since the server started
func GetAddedBuildings(context echo.Context) error {
	return context.JSON(http.StatusOK, helpers.Master.AddedBuildings)
}

// GetAddedRooms returns the information about the rooms that have been added since the server started
func GetAddedRooms(context echo.Context) error {
	return context.JSON(http.StatusOK, helpers.Master.AddedRooms)
}

// GetAddedDevices returns the information about the devices that have been added since the server started
func GetAddedDevices(context echo.Context) error {
	return context.JSON(http.StatusOK, helpers.Master.AddedDevices)
}

// GetAddedUIConfigs returns the information about the UIConfigs that have been added since the server started
func GetAddedUIConfigs(context echo.Context) error {
	return context.JSON(http.StatusOK, helpers.Master.AddedUIConfigs)
}

// GetAllAdditions returns the information about all additions to the database since the server started
func GetAllAdditions(context echo.Context) error {
	total := getAdditions()

	return context.JSON(http.StatusOK, total)
}

func getAdditions() map[string][]helpers.MetricsResponse {
	total := make(map[string][]helpers.MetricsResponse)

	total["added_buildings"] = helpers.Master.AddedBuildings
	total["added_rooms"] = helpers.Master.AddedRooms
	total["added_devices"] = helpers.Master.AddedDevices
	total["added_uiconfigs"] = helpers.Master.AddedUIConfigs

	return total
}

// GetUpdatedBuildings returns the information about the buildings that have been updated since the server started
func GetUpdatedBuildings(context echo.Context) error {
	return context.JSON(http.StatusOK, helpers.Master.UpdatedBuildings)
}

// GetUpdatedRooms returns the information about the rooms that have been updated since the server started
func GetUpdatedRooms(context echo.Context) error {
	return context.JSON(http.StatusOK, helpers.Master.UpdatedRooms)
}

// GetUpdatedDevices returns the information about the devices that have been updated since the server started
func GetUpdatedDevices(context echo.Context) error {
	return context.JSON(http.StatusOK, helpers.Master.UpdatedDevices)
}

// GetUpdatedUIConfigs returns the information about the UIConfigs that have been updated since the server started
func GetUpdatedUIConfigs(context echo.Context) error {
	return context.JSON(http.StatusOK, helpers.Master.UpdatedUIConfigs)
}

// GetAllUpdates returns the information about all objects in the database that were updated since the server started
func GetAllUpdates(context echo.Context) error {
	total := getUpdates()

	return context.JSON(http.StatusOK, total)
}

func getUpdates() map[string][]helpers.MetricsResponse {
	total := make(map[string][]helpers.MetricsResponse)

	total["updated_buildings"] = helpers.Master.UpdatedBuildings
	total["updated_rooms"] = helpers.Master.UpdatedRooms
	total["updated_devices"] = helpers.Master.UpdatedDevices
	total["updated_uiconfigs"] = helpers.Master.UpdatedUIConfigs

	return total
}

// GetDeletedBuildings returns the information about the buildings that have been deleted since the server started
func GetDeletedBuildings(context echo.Context) error {
	return context.JSON(http.StatusOK, helpers.Master.DeletedBuildings)
}

// GetDeletedRooms returns the information about the rooms that have been deleted since the server started
func GetDeletedRooms(context echo.Context) error {
	return context.JSON(http.StatusOK, helpers.Master.DeletedRooms)
}

// GetDeletedDevices returns the information about the devices that have been deleted since the server started
func GetDeletedDevices(context echo.Context) error {
	return context.JSON(http.StatusOK, helpers.Master.DeletedDevices)
}

// GetDeletedUIConfigs returns the information about the UIConfigs that have been deleted since the server started
func GetDeletedUIConfigs(context echo.Context) error {
	return context.JSON(http.StatusOK, helpers.Master.DeletedUIConfigs)
}

// GetAllDeletions returns the information about all objects that have been deleted from the database since the server started
func GetAllDeletions(context echo.Context) error {
	total := getDeletions()

	return context.JSON(http.StatusOK, total)
}

func getDeletions() map[string][]helpers.MetricsResponse {
	total := make(map[string][]helpers.MetricsResponse)

	total["deleted_buildings"] = helpers.Master.DeletedBuildings
	total["deleted_rooms"] = helpers.Master.DeletedRooms
	total["deleted_devices"] = helpers.Master.DeletedDevices
	total["deleted_uiconfigs"] = helpers.Master.DeletedUIConfigs

	return total
}

// GetFullChangesList returns all changes to the database through this server that happened since the server started
func GetFullChangesList(context echo.Context) error {
	fullList := make(map[string]map[string][]helpers.MetricsResponse)

	fullList["additions"] = getAdditions()
	fullList["updates"] = getUpdates()
	fullList["deletions"] = getDeletions()

	return context.JSON(http.StatusOK, fullList)
}
