package helpers

import (
	"fmt"
	"sort"

	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/structs"
)

// AddBuilding adds a building to the database
func AddBuilding(buildingID string, building structs.Building) (DBResponse, *nerr.E) {
	// build response object
	response := DBResponse{
		ObjectID: buildingID,
		Action:   AddAction,
		Success:  false,
	}

	_, err := db.GetDB().CreateBuilding(building)
	if err != nil {
		response.Error = fmt.Sprintf("failed to add the building %s to the database", buildingID)
		return response, nerr.Translate(err).Add(response.Error)
	}

	response.Message = "Building successfully created."

	// return the response
	response.Success = true
	return response, nil
}

// UpdateBuilding updates a building in the database
func UpdateBuilding(buildingID string, building structs.Building) (DBResponse, *nerr.E) {
	// build response object
	response := DBResponse{
		ObjectID: buildingID,
		Action:   UpdateAction,
		Success:  false,
	}
	_, err := db.GetDB().UpdateBuilding(buildingID, building)
	if err != nil {
		response.Error = fmt.Sprintf("failed to update the building %s in the database", buildingID)
		return response, nerr.Translate(err).Add(response.Error)
	}

	response.Message = "Building successfully updated."

	// return the response
	response.Success = true
	return response, nil
}

// GetBuilding gets a building from the database
func GetBuilding(buildingID string) (structs.Building, *nerr.E) {
	toReturn, err := db.GetDB().GetBuilding(buildingID)
	if err != nil {
		dmpsList, ne := GetDMPSBuildings()
		if ne != nil {
			return structs.Building{}, nerr.Translate(err).Addf("failed to get the building %s", buildingID)
		}

		for _, b := range dmpsList {
			if b.ID == buildingID {
				return b, nil
			}
		}

		return structs.Building{}, nerr.Translate(err).Addf("failed to get the building %s", buildingID)
	}

	return toReturn, nil
}

// GetAllBuildings gets all buildings from the database
func GetAllBuildings() ([]structs.Building, *nerr.E) {
	toReturn, err := compiledBuildings()
	if err != nil {
		return nil, nerr.Translate(err).Add("failed to get all buildings")
	}

	return toReturn, nil
}

// DeleteBuilding deletes a building from the database
func DeleteBuilding(buildingID string) (DBResponse, *nerr.E) {
	// build response object
	response := DBResponse{
		ObjectID: buildingID,
		Action:   DeleteAction,
		Success:  false,
	}

	err := db.GetDB().DeleteBuilding(buildingID)
	if err != nil {
		response.Error = fmt.Sprintf("failed to delete the building %s from the database", buildingID)
		return response, nerr.Translate(err).Add(response.Error)
	}

	response.Message = "Building successfully deleted."

	// return the response
	response.Success = true
	return response, nil
}

func compiledBuildings() ([]structs.Building, *nerr.E) {
	piBuildings, err := getPICSBuildings()
	if err != nil {
		return nil, err
	}

	log.L.Infof("# of Pi buildings returned: %d\n", len(piBuildings))

	dmpsBuildings, err := GetDMPSBuildings()
	if err != nil {
		return nil, err
	}

	log.L.Infof("# of DMPS buildings returned: %d\n", len(dmpsBuildings))

	for _, dmpsB := range dmpsBuildings {
		found := false
		for _, piB := range piBuildings {
			if dmpsB.ID == piB.ID {
				found = true
				break
			}
		}

		if !found {
			piBuildings = append(piBuildings, dmpsB)
		}
	}

	sort.Slice(piBuildings, func(i, j int) bool {
		return piBuildings[i].ID < piBuildings[j].ID
	})

	return piBuildings, nil
}

func getPICSBuildings() ([]structs.Building, *nerr.E) {
	toReturn, err := db.GetDB().GetAllBuildings()
	if err != nil {
		return nil, nerr.Translate(err).Add("failed to get all buildings")
	}

	return toReturn, nil
}
