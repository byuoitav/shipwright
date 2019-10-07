package handlers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/byuoitav/common/log"
	sd "github.com/byuoitav/common/state/statedefinition"
	"github.com/byuoitav/common/structs"
	"github.com/byuoitav/shipwright/helpers"
	schedule "github.com/byuoitav/wso2services/classschedules/registrar"
	"github.com/labstack/echo"
)

// UpdateStaticRoom updates a static room
func UpdateStaticRoom(context echo.Context) error {
	roomID := context.Param("room")

	var room sd.StaticRoom
	err := context.Bind(&room)
	if err != nil {
		log.L.Errorf("failed to bind request body for %s : %s", roomID, err.Error())
		return context.JSON(http.StatusBadRequest, err)
	}

	// call helper function
	ne := helpers.UpdateStaticRoom(roomID, room)
	if ne != nil {
		log.L.Errorf("%s", ne.Error())
		return context.JSON(http.StatusInternalServerError, ne.Error())
	}

	log.L.Debugf("%s was changed to maintenance mode, %s", roomID, room)

	return context.JSON(http.StatusOK, room)
}

// AddRoom adds a room to the database
func AddRoom(context echo.Context) error {
	log.L.Debugf("%s Starting AddRoom...", helpers.RoomsTag)

	// get information from the context
	roomID := context.Param("room")

	var room structs.Room
	err := context.Bind(&room)
	if err != nil {
		msg := fmt.Sprintf("failed to bind request body for %s : %s", roomID, err.Error())
		log.L.Errorf("%s %s", helpers.RoomsTag, msg)
		return context.JSON(http.StatusBadRequest, err)
	}

	// call helper function
	result, ne := helpers.AddRoom(roomID, room)
	if ne != nil {
		log.L.Errorf("%s %s", helpers.RoomsTag, ne.Error())
		return context.JSON(http.StatusInternalServerError, result)
	}

	log.L.Debugf("%s The room %s was successfully created!", helpers.RoomsTag, roomID)
	return context.JSON(http.StatusOK, result)
}

// AddMultipleRooms adds a set of rooms to the database
func AddMultipleRooms(context echo.Context) error {
	log.L.Debugf("%s Starting AddMultipleRooms...", helpers.RoomsTag)

	// get information from the context
	var rooms []structs.Room

	err := context.Bind(&rooms)
	if err != nil {
		msg := fmt.Sprintf("failed to bind request body for multiple rooms : %s", err.Error())
		log.L.Errorf("%s %s", helpers.RoomsTag, msg)
		return context.JSON(http.StatusBadRequest, err)
	}

	var results []helpers.DBResponse
	// call helper function as we iterate
	for _, r := range rooms {
		res, ne := helpers.AddRoom(r.ID, r)
		if ne != nil {
			log.L.Errorf("%s %s", helpers.RoomsTag, ne.Error())
		}

		results = append(results, res)
	}

	log.L.Debugf("%s The rooms were successfully created!", helpers.RoomsTag)
	return context.JSON(http.StatusOK, results)
}

// GetRoom gets a room from the database based on the given ID
func GetRoom(context echo.Context) error {
	log.L.Debugf("%s Starting GetRoom...", helpers.RoomsTag)

	// get information from the context
	roomID := context.Param("room")

	room, err := helpers.GetRoom(roomID)
	if err != nil {
		msg := fmt.Sprintf("failed to get the room %s : %s", roomID, err.Error())
		log.L.Errorf("%s %s", helpers.RoomsTag, msg)
		return context.JSON(http.StatusInternalServerError, err)
	}

	log.L.Debugf("%s Successfully found the room %s!", helpers.RoomsTag, roomID)
	return context.JSON(http.StatusOK, room)
}

// GetAllRooms gets all rooms from the database
func GetAllRooms(context echo.Context) error {
	log.L.Debugf("%s Starting GetAllRooms...", helpers.RoomsTag)

	rooms, err := helpers.GetAllRooms()
	if err != nil {
		msg := fmt.Sprintf("failed to get all rooms : %s", err.Error())
		log.L.Errorf("%s %s", helpers.RoomsTag, msg)
		return context.JSON(http.StatusBadRequest, err)
	}

	log.L.Debugf("%s Successfully got all rooms!", helpers.RoomsTag)
	return context.JSON(http.StatusOK, rooms)
}

// GetRoomsByBuilding gets all rooms in a single building from the database, based on a given building ID
func GetRoomsByBuilding(context echo.Context) error {
	log.L.Debugf("%s Starting GetRoomsByBuilding...", helpers.RoomsTag)

	// get information from the context
	buildingID := context.Param("building")

	rooms, err := helpers.GetRoomsByBuilding(buildingID)
	if err != nil {
		msg := fmt.Sprintf("failed to get all of the rooms in the building %s : %s", buildingID, err.Error())
		log.L.Errorf("%s %s", helpers.RoomsTag, msg)
		return context.JSON(http.StatusInternalServerError, err)
	}

	log.L.Debugf("%s Successfully got all rooms in the building %s", helpers.RoomsTag, buildingID)
	return context.JSON(http.StatusOK, rooms)
}

// UpdateRoom updates a room in the database
func UpdateRoom(context echo.Context) error {
	log.L.Debugf("%s Starting UpdateRoom...", helpers.RoomsTag)

	// get information from the context
	roomID := context.Param("room")

	var room structs.Room
	err := context.Bind(&room)
	if err != nil {
		msg := fmt.Sprintf("failed to bind request body for %s : %s", roomID, err.Error())
		log.L.Errorf("%s %s", helpers.RoomsTag, msg)
		return context.JSON(http.StatusBadRequest, err)
	}

	// call the helper function
	result, ne := helpers.UpdateRoom(roomID, room)
	if ne != nil {
		log.L.Errorf("%s %s", helpers.RoomsTag, ne.Error())
		return context.JSON(http.StatusInternalServerError, result)
	}

	log.L.Debugf("%s The room %s was successfully updated!", helpers.RoomsTag, roomID)
	return context.JSON(http.StatusOK, result)
}

// UpdateMultipleRooms updates a set of rooms in the database
func UpdateMultipleRooms(context echo.Context) error {
	log.L.Debugf("%s Starting UpdateMultipleRooms...", helpers.RoomsTag)

	// get information from the context
	var rooms map[string]structs.Room

	err := context.Bind(&rooms)
	if err != nil {
		msg := fmt.Sprintf("failed to bind request body for multiple buildings : %s", err.Error())
		log.L.Errorf("%s %s", helpers.RoomsTag, msg)
		return context.JSON(http.StatusBadRequest, err)
	}

	var results []helpers.DBResponse
	// call helper function as we iterate
	for id, room := range rooms {
		res, ne := helpers.UpdateRoom(id, room)
		if ne != nil {
			log.L.Errorf("%s %s", helpers.BuildingsTag, ne.Error())
		}

		results = append(results, res)
	}

	log.L.Debugf("%s The rooms were successfully updated!", helpers.RoomsTag)
	return context.JSON(http.StatusOK, results)
}

// DeleteRoom deletes a room from the database based on the given ID
func DeleteRoom(context echo.Context) error {
	log.L.Debugf("%s Starting DeleteRoom...", helpers.RoomsTag)

	// get information from the context
	roomID := context.Param("room")

	// call helper function
	result, ne := helpers.DeleteRoom(roomID)
	if ne != nil {
		log.L.Errorf("%s %s", helpers.RoomsTag, ne.Error())
		return context.JSON(http.StatusInternalServerError, result)
	}

	log.L.Debugf("%s The room %s was successfully deleted!", helpers.RoomsTag, roomID)
	return context.JSON(http.StatusOK, result)
}

// GetRoomConfigurations returns a list of possible room configurations
func GetRoomConfigurations(context echo.Context) error {
	log.L.Debugf("%s Starting GetRoomConfigurations...", helpers.RoomsTag)

	configurations, err := helpers.GetRoomConfigurations()
	if err != nil {
		msg := fmt.Sprintf("failed to get all room configurations : %s", err.Error())
		log.L.Errorf("%s %s", helpers.RoomsTag, msg)
		return context.JSON(http.StatusInternalServerError, err)
	}

	log.L.Debugf("%s Successfully got all room configurations!", helpers.RoomsTag)
	return context.JSON(http.StatusOK, configurations)
}

// GetRoomDesignations returns a list of possible room designations
func GetRoomDesignations(context echo.Context) error {
	log.L.Debugf("%s Starting GetRoomDesignations...", helpers.RoomsTag)

	designations, err := helpers.GetRoomDesignations()
	if err != nil {
		msg := fmt.Sprintf("failed to get all room designations : %s", err.Error())
		log.L.Errorf("%s %s", helpers.RoomsTag, msg)
		return context.JSON(http.StatusInternalServerError, err)
	}

	log.L.Debugf("%s Successfully got all room designations!", helpers.RoomsTag)
	return context.JSON(http.StatusOK, designations)
}

// GetRoomClassSchedule gets the class schedule for a room
func GetRoomClassSchedule(context echo.Context) error {
	roomID := context.Param("roomID")

	//find sunday
	sunday := getsunday(time.Now())

	classes, err := schedule.GetClassScheduleForTimeBlock(roomID, sunday, sunday.AddDate(0, 0, 7))
	if err != nil {
		log.L.Infof("failed: %s", err.Error())
	}
	return context.JSON(http.StatusOK, classes)
}

func NukeRoom(context echo.Context) error {
	roomID := context.Param("roomID")

	log.L.Infof("Nulclear Launch Detected %v", roomID)
	err := helpers.NukeRoom(roomID)
	if err != nil {
		return context.String(http.StatusInternalServerError, err.Error())
	}

	log.L.Infof("Nulclear Launch %v connected", roomID)

	return context.String(http.StatusOK, "ok")

}

func getsunday(t time.Time) time.Time {
	for t.Weekday() != time.Sunday {
		t = t.AddDate(0, 0, -1)
	}
	return time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, t.Location())
}
