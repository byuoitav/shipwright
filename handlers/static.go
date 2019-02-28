package handlers

import (
	"fmt"
	"net/http"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/shipwright/helpers"
	"github.com/labstack/echo"
)

// GetAllRoomCombinedStateRecords returns a list of combined room state records
func GetAllRoomCombinedStateRecords(context echo.Context) error {
	log.L.Debugf("%s Starting GetAllRoomCombinedStateRecords...", helpers.StaticTag)

	sDevices, err := helpers.GetAllRoomCombinedStateRecords()
	if err != nil {
		msg := fmt.Sprintf("failed to GetAllRoomCombinedStateRecords : %s", err.Error())
		log.L.Errorf("%s %s", helpers.StaticTag, msg)
		return context.JSON(http.StatusInternalServerError, err)
	}

	log.L.Debugf("%s Successfully GetAllRoomCombinedStateRecords!", helpers.StaticTag)
	return context.JSON(http.StatusOK, sDevices)
}

// GetRoomCombinedStateRecord returns a list of combined room state records
func GetRoomCombinedStateRecord(context echo.Context) error {
	log.L.Debugf("%s Starting GetRoomCombinedStateRecord...", helpers.StaticTag)

	roomID := context.Param("room")

	sDevices, err := helpers.GetRoomCombinedStateRecord(roomID)
	if err != nil {
		msg := fmt.Sprintf("failed to GetRoomCombinedStateRecord : %s", err.Error())
		log.L.Errorf("%s %s", helpers.StaticTag, msg)
		return context.JSON(http.StatusInternalServerError, err)
	}

	log.L.Debugf("%s Successfully GetRoomCombinedStateRecord!", helpers.StaticTag)
	return context.JSON(http.StatusOK, sDevices)
}

// GetAllStaticDeviceRecords returns a list of all the static device records
func GetAllStaticDeviceRecords(context echo.Context) error {
	log.L.Debugf("%s Starting GetAllStaticDeviceRecords...", helpers.StaticTag)

	sDevices, err := helpers.GetAllStaticDeviceRecords()
	if err != nil {
		msg := fmt.Sprintf("failed to get all static device records : %s", err.Error())
		log.L.Errorf("%s %s", helpers.StaticTag, msg)
		return context.JSON(http.StatusInternalServerError, err)
	}

	log.L.Debugf("%s Successfully got all static device records!", helpers.StaticTag)
	return context.JSON(http.StatusOK, sDevices)
}

// GetAllStaticRoomRecords returns a list of all the static room records
func GetAllStaticRoomRecords(context echo.Context) error {
	log.L.Debugf("%s Starting GetAllStaticRoomRecords...", helpers.StaticTag)

	sRooms, err := helpers.GetAllStaticRoomRecords()
	if err != nil {
		msg := fmt.Sprintf("failed to get all static room records : %s", err.Error())
		log.L.Errorf("%s %s", helpers.StaticTag, msg)
		return context.JSON(http.StatusInternalServerError, err)
	}

	log.L.Debugf("%s Successfully got all static room records!", helpers.StaticTag)
	return context.JSON(http.StatusOK, sRooms)
}
