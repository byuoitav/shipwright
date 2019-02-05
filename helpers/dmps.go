package helpers

import (
	"fmt"
	"strings"

	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/structs"
)

// GetDMPSBuildings gets the list of buildings that have DMPS systems
func GetDMPSBuildings() ([]structs.Building, *nerr.E) {
	dumpList, err := db.GetDB().GetDMPSList()
	if err != nil {
		return nil, nerr.Translate(err).Add("failed to get the DMPS list")
	}

	var toReturn []structs.Building

	for _, dump := range dumpList.List {
		buildingID := strings.Split(dump.Hostname, "-")[0]

		found := false

		for _, b := range toReturn {
			if b.ID == buildingID {
				found = true
				break
			}
		}

		if !found {
			building := structs.Building{
				ID:   buildingID,
				Name: buildingID,
				Tags: []string{"dmps"},
			}
			toReturn = append(toReturn, building)
		}
	}

	return toReturn, nil
}

// GetDMPSRooms gets the list of rooms that have DMPS systems
func GetDMPSRooms() ([]structs.Room, *nerr.E) {
	dumpList, err := db.GetDB().GetDMPSList()
	if err != nil {
		return nil, nerr.Translate(err).Add("failed to get the DMPS list")
	}

	var toReturn []structs.Room

	for _, dump := range dumpList.List {
		hostnameParts := strings.Split(dump.Hostname, "-")

		roomID := fmt.Sprintf("%s-%s", hostnameParts[0], hostnameParts[1])

		found := false

		for _, r := range toReturn {
			if r.ID == roomID {
				found = true
				break
			}
		}

		if !found {
			room := structs.Room{
				ID:          roomID,
				Name:        roomID,
				Designation: "production",
				Configuration: structs.RoomConfiguration{
					ID: "DMPS",
				},
				Tags: []string{"dmps"},
			}
			toReturn = append(toReturn, room)
		}
	}

	return toReturn, nil
}
