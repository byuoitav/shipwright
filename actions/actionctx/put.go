package actionctx

import (
	"context"

	"github.com/byuoitav/common/state/statedefinition"
	"github.com/byuoitav/common/structs"
	"github.com/byuoitav/common/v2/events"
)

type key uint8

const (
	event key = iota
	staticDevice
	alert
)

// PutEvent puts an event into ctx
func PutEvent(ctx context.Context, v events.Event) {
	ctx = context.WithValue(ctx, event, v)
}

// PutStaticDevice puts an event into ctx
func PutStaticDevice(ctx context.Context, v statedefinition.StaticDevice) {
	ctx = context.WithValue(ctx, staticDevice, v)
}

// PutAlert puts an event into ctx
func PutAlert(ctx context.Context, v structs.Alert) {
	ctx = context.WithValue(ctx, alert, v)
}
