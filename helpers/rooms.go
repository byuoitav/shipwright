package helpers

import (
	"fmt"
	"sort"
	"strings"

	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	sd "github.com/byuoitav/common/state/statedefinition"
	"github.com/byuoitav/common/structs"
	cache "github.com/byuoitav/shipwright/state/cache"
)

//Update the static rooms (putting them in and out of maintenance mode etc.)
func UpdateStaticRoom(roomID string, room sd.StaticRoom) *nerr.E {

	room.RoomID = roomID
	// buildingID := strings.Split(roomID, "-")
	// T := true
	// room = sd.StaticRoom{
	// 	BuildingID:      buildingID[0],
	// 	RoomID:          roomID,
	// 	MaintenenceMode: &T,
	// 	UpdateTimes: map[string]time.Time{
	// 		"maintenance-mode": time.Now(),
	// 	},
	// }
	changes, room, err := cache.GetCache("default").CheckAndStoreRoom(room)
	if err != nil {
		log.L.Errorf("%s", err.Stack)
		return nerr.Translate(err)
	}
	log.L.Infof("%v", changes)
	return nil
}

// AddRoom adds a room to the database
func AddRoom(roomID string, room structs.Room) (DBResponse, *nerr.E) {
	// build response object
	response := DBResponse{
		ObjectID: roomID,
		Action:   AddAction,
		Success:  false,
	}

	room, err := db.GetDB().CreateRoom(room)
	if err != nil {
		response.Error = fmt.Sprintf("failed to add the room %s to the database", roomID)
		return response, nerr.Translate(err).Add(response.Error)
	}

	response.Message = "Room successfully created."

	// return the response
	response.Success = true
	return response, nil
}

// UpdateRoom updates a room in the database
func UpdateRoom(roomID string, room structs.Room) (DBResponse, *nerr.E) {
	// build response object
	response := DBResponse{
		ObjectID: roomID,
		Action:   UpdateAction,
		Success:  false,
	}

	room, err := db.GetDB().UpdateRoom(roomID, room)
	if err != nil {
		response.Error = fmt.Sprintf("failed to update the room %s in the database", roomID)
		return response, nerr.Translate(err).Add(response.Error)
	}

	response.Message = "Room successfully updated."

	// return the response
	response.Success = true
	return response, nil
}

// GetRoom gets a room from the database
func GetRoom(roomID string) (structs.Room, *nerr.E) {
	room, err := db.GetDB().GetRoom(roomID)
	if err != nil {
		dmpsList, ne := GetDMPSRooms()
		if ne != nil {
			return structs.Room{}, nerr.Translate(err).Addf("failed to get the room %s", roomID)
		}

		for _, r := range dmpsList {
			if r.ID == roomID {
				return r, nil
			}
		}

		return structs.Room{}, nerr.Translate(err).Addf("failed to get the room %s", roomID)
	}

	return room, nil
}

// GetAllRooms gets a list of all rooms in the database
func GetAllRooms() ([]structs.Room, *nerr.E) {
	rooms, err := compiledRooms()
	if err != nil {
		return rooms, nerr.Translate(err).Add("failed to get all rooms")
	}

	return rooms, nil
}

// GetRoomsByBuilding gets a list of all rooms in a building
func GetRoomsByBuilding(buildingID string) ([]structs.Room, *nerr.E) {
	rooms, err := compiledRooms()
	if err != nil {
		return rooms, nerr.Translate(err).Addf("failed to get all rooms in the building %s", buildingID)
	}

	var toReturn []structs.Room

	for _, r := range rooms {
		if strings.Contains(r.ID, buildingID) {
			toReturn = append(toReturn, r)
		}
	}

	return toReturn, nil
}

// DeleteRoom deletes a room in the database
func DeleteRoom(roomID string) (DBResponse, *nerr.E) {
	// build response object
	response := DBResponse{
		ObjectID: roomID,
		Action:   DeleteAction,
		Success:  false,
	}

	err := db.GetDB().DeleteRoom(roomID)
	if err != nil {
		response.Error = fmt.Sprintf("failed to delete the room %s from the database", roomID)
		return response, nerr.Translate(err).Add(response.Error)
	}

	response.Message = "Room successfully deleted."

	// return the response
	response.Success = true
	return response, nil
}

// GetRoomConfigurations gets a list of possible room configurations
func GetRoomConfigurations() ([]structs.RoomConfiguration, *nerr.E) {
	configurations, err := db.GetDB().GetAllRoomConfigurations()
	if err != nil {
		return configurations, nerr.Translate(err).Add("failed to get all room configurations")
	}

	return configurations, nil
}

// GetRoomDesignations gets a list of possible room designations
func GetRoomDesignations() ([]string, *nerr.E) {
	designations, err := db.GetDB().GetRoomDesignations()
	if err != nil {
		return designations, nerr.Translate(err).Add("failed to get all room designations")
	}

	return designations, nil
}

func compiledRooms() ([]structs.Room, *nerr.E) {
	piRooms, err := getPICSRooms()
	if err != nil {
		return nil, err
	}

	log.L.Infof("# of Pi rooms returned: %d\n", len(piRooms))

	dmpsRooms, err := GetDMPSRooms()
	if err != nil {
		return nil, err
	}

	log.L.Infof("# of DMPS rooms returned: %d\n", len(dmpsRooms))

	for _, dmpsR := range dmpsRooms {
		found := false
		for _, piR := range piRooms {
			if dmpsR.ID == piR.ID {
				found = true
				break
			}
		}

		if !found {
			log.L.Debugf("\nhere's a straggler: %s\n", dmpsR.ID)
			piRooms = append(piRooms, dmpsR)
		}
	}

	sort.Slice(piRooms, func(i, j int) bool {
		return piRooms[i].ID < piRooms[j].ID
	})

	return piRooms, nil
}

func getPICSRooms() ([]structs.Room, *nerr.E) {
	rooms, err := db.GetDB().GetAllRooms()
	if err != nil {
		return rooms, nerr.Translate(err).Add("failed to get all rooms")
	}

	return rooms, nil
}
