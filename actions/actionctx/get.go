package actionctx

import (
	"context"

	"github.com/byuoitav/common/state/statedefinition"
	"github.com/byuoitav/common/structs"
	"github.com/byuoitav/common/v2/events"
)

// GetEvent returns an event/true from ctx if there is one, and false if there isn't.
func GetEvent(ctx context.Context) (events.Event, bool) {
	v, ok := ctx.Value(event).(events.Event)
	return v, ok
}

// GetStaticDevices returns a static device/true from ctx if there is one, and false if there isn't.
func GetStaticDevices(ctx context.Context) ([]statedefinition.StaticDevice, bool) {
	v, ok := ctx.Value(staticDevices).([]statedefinition.StaticDevice)
	return v, ok
}

// GetStaticDevice returns a static device/true from ctx if there is one, and false if there isn't.
func GetStaticDevice(ctx context.Context) (statedefinition.StaticDevice, bool) {
	v, ok := ctx.Value(staticDevice).(statedefinition.StaticDevice)
	return v, ok
}

// GetAlert returns an alert/true from ctx if there is one, and false if there isn't.
func GetAlert(ctx context.Context) (structs.Alert, bool) {
	v, ok := ctx.Value(alert).(structs.Alert)
	return v, ok
}

// GetAlert returns an alert/true from ctx if there is one, and false if there isn't.
func GetAlertSet(ctx context.Context) ([]structs.Alert, bool) {
	v, ok := ctx.Value(alertSet).([]structs.Alert)
	if !ok || len(v) == 0 {
		//check if there's a singular alert, if there is we'll put that in the array to return.
		tmp, ok := GetAlert(ctx)
		if !ok {
			return v, ok
		}

		return []structs.Alert{tmp}, true
	}
	return v, ok
}
