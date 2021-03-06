package circular

import (
	"context"

	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/structs"
	"github.com/byuoitav/shipwright/actions/then"
	"github.com/byuoitav/shipwright/alertstore"
	"go.uber.org/zap"
)

// UpsertAlert .
func UpsertAlert(ctx context.Context, with []byte, log *zap.SugaredLogger) *nerr.E {
	alert := structs.Alert{}
	err := then.FillStructFromTemplate(ctx, string(with), &alert)
	if err != nil {
		return err.Addf("failed to add alert")
	}

	_, err = alertstore.AddAlert(alert)
	if err != nil {
		return err.Addf("failed to add alert")
	}
	return nil
}
