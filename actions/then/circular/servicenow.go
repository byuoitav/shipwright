package circular

import (
	"context"

	"github.com/byuoitav/shipwright/alertstore"
	"go.uber.org/zap"

	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/servicenow"
	"github.com/byuoitav/shipwright/actions/actionctx"
)

//SyncRoomIssueWithServiceNow will sync the RoomIssue with an ticket (incident or repair)
func SyncRoomIssueWithServiceNow(ctx context.Context, with []byte, log *zap.SugaredLogger) (err *nerr.E) {
	//get the RoomIssue from the context
	roomIssue, ok := actionctx.GetRoomIssue(ctx)

	if !ok {
		log.Errorf("Failed to get RoomIssue")
		return nerr.Create("Must have RoomIssue to create ticket", "")
	}

	incidentID, syncError := servicenow.SyncServiceNowWithRoomIssue(roomIssue)

	if syncError != nil {
		log.Errorf("Unable to sync ticket with room issue")
		return nerr.Translate(syncError)
	}

	if len(roomIssue.IncidentID) == 0 && len(incidentID) > 0 {
		roomIssue.IncidentID = append(roomIssue.IncidentID, incidentID)
		roomIssueError := alertstore.UpdateRoomIssue(roomIssue)

		if roomIssueError != nil {
			log.Errorf("Unable to update Room Issue in persistence store")
			return nerr.Translate(roomIssueError)
		}
	}

	return nil
}
