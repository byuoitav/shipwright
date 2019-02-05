package then

import (
	"bytes"
	"context"
	"encoding/json"
	"text/template"

	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/state/statedefinition"
	"github.com/byuoitav/common/structs"
	"github.com/byuoitav/common/v2/events"
	"github.com/byuoitav/shipwright/actions/actionctx"
)

type templateData struct {
	Event        events.Event
	StaticDevice statedefinition.StaticDevice
}

// AddAlert .
func AddAlert(ctx context.Context, with []byte) *nerr.E {
	data := templateData{}

	if event, ok := actionctx.GetEvent(ctx); ok {
		data.Event = event
	}

	if dev, ok := actionctx.GetStaticDevice(ctx); ok {
		data.StaticDevice = dev
	}

	// fill the alert template
	t, gerr := template.New("alert").Parse(string(with))
	if gerr != nil {
		return nerr.Translate(gerr).Addf("failed to add alert")
	}

	buf := &bytes.Buffer{}
	gerr = t.Execute(buf, data)
	if gerr != nil {
		return nerr.Translate(gerr).Addf("failed to add alert")
	}

	// unmarshal filled template into alert struct
	alert := structs.Alert{}
	gerr = json.Unmarshal(buf.Bytes(), &alert)
	if gerr != nil {
		return nerr.Translate(gerr).Addf("failed to add alert")
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
