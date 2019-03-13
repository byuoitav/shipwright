package circular

import "github.com/byuoitav/shipwright/actions/then"

func init() {
	then.Add("upsert-alert", UpsertAlert)
	then.Add("add-action", AddAction)
	// then.Add("sync-service-now", SyncRoomIssueWithServiceNow)
}
