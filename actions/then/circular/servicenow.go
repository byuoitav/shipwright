package circular

import (
	"context"

	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/servicenow"
	"github.com/byuoitav/shipwright/actions/actionctx"
)

//SyncRoomIssueWithServiceNow will sync the RoomIssue with an ticket (incident or repair)
func SyncRoomIssueWithServiceNow(ctx context.Context, with []byte) (err *nerr.E) {
	//get the RoomIssue from the context
	roomIssue, ok := actionctx.GetRoomIssue(ctx)

	if !ok {
		log.L.Errorf("Failed to get RoomIssue")
		return nerr.Create("Must have RoomIssue to create ticket", "")
	}

	incidentID, err := servicenow.SyncServiceNowWithRoomIssue(roomIssue)

	if err != nil {
		log.L.Errorf("Unable to sync incident")
	}

	if len(roomIssue.IncidentID) == 0 {
		roomIssue.IncidentID = incidentID
	}

}
