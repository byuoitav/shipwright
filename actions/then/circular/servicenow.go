package circular

import (
	"context"

	"github.com/byuoitav/shipwright/alertstore"

	"github.com/byuoitav/common/log"
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

	incidentID, syncError := servicenow.SyncServiceNowWithRoomIssue(roomIssue)

	if syncError != nil {
		log.L.Errorf("Unable to sync ticket with room issue")
		return nerr.Translate(syncError)
	}

	if len(roomIssue.IncidentID) == 0 {
		roomIssue.IncidentID = incidentID
		roomIssueError := alertstore.UpdateRoomIssue(roomIssue)

		if roomIssueError != nil {
			log.L.Errorf("Unable to update Room Issue in persistence store")
			return nerr.Translate(roomIssueError)
		}
	}

	return nil
}
