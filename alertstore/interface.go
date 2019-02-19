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

//GetRoomIssue Gets a specific roomIssue by IssueID
func GetRoomIssue(IssueID string) (structs.RoomIssue, *nerr.E) {
	return store.getRoomIssue(IssueID)
}

//GetAllIssues Gets a specific roomIssue by IssueID
func GetAllIssues() ([]structs.RoomIssue, *nerr.E) {
	return store.getAllIssues()
}

//UpdateRoomIssue Gets a specific roomIssue by IssueID
func UpdateRoomIssue(i structs.RoomIssue) *nerr.E {
	return store.editIssueInformation(i)
}

//ResolveIssue Gets a specific roomIssue by IssueID
func ResolveIssue(resInfo structs.ResolutionInfo, id string) *nerr.E {
	return store.resolveIssue(resInfo, id)
}
