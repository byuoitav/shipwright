package alertstore

import (
	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/structs"
)

//AddAlert takes an alert and stores it in the store. It will return the AlertID.
func AddAlert(a structs.Alert) (string, *nerr.E) {

	a.Source = Interface
	var err *nerr.E
	a, err = AddRoomInformationToAlert(a)
	if err != nil {
		return "", err.Addf("Couldn't add room info to alert")

	}

	return store.putAlert(a)
}

//GetAlert Gets a specific alert by AlertID
func GetAlert(AlertID string) (structs.Alert, *nerr.E) {
	return store.getAlert(AlertID)
}

/*
//Generates a 'Hash that is used to create new values'
func ResolveAlertSet(resInfo structs.ResolutionInfo, alertIDs ...string) *nerr.E {

	room := ""
	sev := ""
	for i := range alertIDs {
		//check to see if they're all in the same room, if not, we don't let it happen.

		tmpRoom := ParseRoomFromID(alertIDs[i])
		if room == "" {
			room = tmpRoom
		} else if room != tmpRoom {
			return nerr.Create("cannot batch resolve alerts not in the same room", "invalid-batch")
		}

		tmpSev := ParseSeverityFromID(alertIDs[i])
		if sev == "" {
			sev = tmpSev
		} else if sev != tmpSev {
			return nerr.Create("cannot batch resolve with separate severities", "invalid-batch")
		}

	}

	if len(alertIDs) < 1 {
		return nerr.Create("Must include an alertID", "invalid-input")
	}

	str := ""
	for i := range alertIDs {
		str += alertIDs[i]
	}
	hash := md5.Sum([]byte(str))
	resInfo.ResolutionHash = fmt.Sprintf("%x %v", hash, len(alertIDs))

	//resolve
	return store.resolveAlertSet(resInfo, alertIDs...)
}

// AddTagToAlert adds tag to the alert matching id and resubmits it to the alert store.
func AddTagToAlert(id string, tag string) *nerr.E {
	alert, err := store.getAlert(id)
	if err != nil {
		return err.Addf("failed to add tag to alert")
	}

	alert.AlertTags = append(alert.AlertTags, tag)

	_, err = store.putAlert(alert)
	return err
}

// RemoveTagFromAlert removes all tags matching tag from the alert matching id and resubmits it to the alert store.
func RemoveTagFromAlert(id string, tag string) *nerr.E {
	alert, err := store.getAlert(id)
	if err != nil {
		return err.Addf("failed to remove tag from alert")
	}

	tags := []string{}

	for i := range alert.AlertTags {
		if alert.AlertTags[i] != tag {
			tags = append(tags, alert.AlertTags[i])
		}
	}

	alert.AlertTags = tags

	_, err = store.putAlert(alert)
	return err
}
*/
