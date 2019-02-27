package roomaggregation

import (
	"github.com/byuoitav/common/structs"
)

func CalculateAggregateInfo(roomIssue structs.RoomIssue) {
	issueType := strings.Split(roomIssue.RoomIssueID, "-")[2]
	var otherType string
	if (issueType == "critical"){
		otherType = "warning")
	} else {
		otherType = "critical")
	}
	var aggregateRoom statedefinition.StaticRoom
	// 1.) Loop through the alerting devices on the room issue
	// 2.) Dump in all that aren't there
	// 3.) Repeat for the other issue (you should make that prettier
	// 4.) Send that to Store Room State in the Cache
	

}
