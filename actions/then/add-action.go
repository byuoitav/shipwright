package then

import (
	"context"

	"github.com/byuoitav/common/nerr"
	"go.uber.org/zap"
)

// AddAction .
func AddAction(ctx context.Context, with []byte, log *zap.SugaredLogger) *nerr.E {
	// action := actions.Action{}
	/*
		alert := structs.Alert{}
		err := fillStructFromTemplate(ctx, string(with), &alert)
		if err != nil {
			return err.Addf("failed to add alert")
		}
	*/

	/*
		_, err := store.AddAlert(alert)
		if err != nil {
			return err.Addf("failed to add alert")
		}
	*/

	// add alert to context

	return nil
}
