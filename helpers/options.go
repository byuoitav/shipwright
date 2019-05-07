package helpers

import (
	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/structs"
)

// GetIcons gets a list of icons from the database
func GetIcons() ([]string, *nerr.E) {
	iconList, err := db.GetDB().GetIcons()
	if err != nil {
		return iconList, nerr.Translate(err).Add("failed to get icon list")
	}

	return iconList, nil
}

// GetTemplates gets a list of templates from the database
func GetTemplates() ([]structs.Template, *nerr.E) {
	templateList, err := db.GetDB().GetAllTemplates()
	if err != nil {
		return templateList, nerr.Translate(err).Add("failed to get all templates")
	}

	return templateList, nil
}

// GetMenuTree returns the fully built out menu tree
func GetMenuTree() (structs.MenuTree, *nerr.E) {
	groups, ne := GetAllAttributeGroups()
	if ne != nil {
		log.L.Errorf("failed to get all attributes when building the menu tree: %s", ne.String())
		return structs.MenuTree{}, nil
	}

	order, err := db.GetDB().GetMenuTree()
	if err != nil {
		log.L.Errorf("failed to get menu tree: %s", err.Error())
		return structs.MenuTree{}, nil
	}

	var toReturn structs.MenuTree

	for _, id := range order {
		for _, group := range groups {
			if group.ID == id {
				toReturn.Groups = append(toReturn.Groups, group)
			}
		}
	}

	return toReturn, nil
}
