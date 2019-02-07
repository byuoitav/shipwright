package circular

import (
	"context"

	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/shipwright/actions"
	"github.com/byuoitav/shipwright/actions/then"
	"go.uber.org/zap"
)

// AddAction .
func AddAction(ctx context.Context, with []byte, log *zap.SugaredLogger) *nerr.E {
	action := actions.Action{}
	err := then.FillStructFromTemplate(ctx, string(with), &alert)
	if err != nil {
		return err.Addf("failed to add alert")
	}

	actions.DefaulActionManager().ManageAction()
	return nil
}
