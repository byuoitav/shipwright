package helpers

import (
	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/structs"
)

// GetAttributeGroup gets one attribute set from the database
func GetAttributeGroup(groupID string) (structs.Group, *nerr.E) {
	group, err := db.GetDB().GetAttributeGroup(groupID)
	if err != nil {
		return group, nerr.Translate(err)
	}

	return group, nil
}

// GetAllAttributeGroups gets a list of all the attribute sets from the database
func GetAllAttributeGroups() ([]structs.Group, *nerr.E) {
	groups, err := db.GetDB().GetAllAttributeGroups()
	if err != nil {
		return groups, nerr.Translate(err)
	}

	return groups, nil
}
