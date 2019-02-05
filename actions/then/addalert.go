package then

import (
	"context"

	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/structs"
	"go.uber.org/zap"
)

// AddAlert .
func AddAlert(ctx context.Context, with []byte, log *zap.SugaredLogger) *nerr.E {
	alert := structs.Alert{}
	err := fillStructFromTemplate(ctx, string(with), &alert)
	if err != nil {
		return err.Addf("failed to add alert")
	}

	/*
		_, err := store.AddAlert(alert)
		if err != nil {
			return err.Addf("failed to add alert")
		}
	*/

	// add alert to context

	return nil
}
