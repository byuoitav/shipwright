package then

import (
	"bytes"
	"context"
	"encoding/json"
	"strings"
	"text/template"

	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/state/statedefinition"
	"github.com/byuoitav/common/structs"
	"github.com/byuoitav/common/v2/events"
	"github.com/byuoitav/shipwright/actions/actionctx"
)

type templateData struct {
	Event         events.Event
	StaticDevices []statedefinition.StaticDevice
	StaticDevice  statedefinition.StaticDevice
	Alert         structs.Alert
}

// FillStructFromTemplate .
func FillStructFromTemplate(ctx context.Context, tmpl string, fill interface{}) *nerr.E {
	data := templateData{}

	if event, ok := actionctx.GetEvent(ctx); ok {
		data.Event = event
	}

	if devs, ok := actionctx.GetStaticDevices(ctx); ok {
		data.StaticDevices = devs
	}

	if dev, ok := actionctx.GetStaticDevice(ctx); ok {
		data.StaticDevice = dev
	}

	if alert, ok := actionctx.GetAlert(ctx); ok {
		data.Alert = alert
	}

	t, gerr := template.New("then-template").Parse(tmpl)
	if gerr != nil {
		return nerr.Translate(gerr).Addf("failed to fill template")
	}

	buf := &bytes.Buffer{}
	gerr = t.Execute(buf, data)
	if gerr != nil {
		return nerr.Translate(gerr).Addf("failed to fill template")
	}

	// replace square brackets with curly braces
	str := strings.Replace(buf.String(), "[[", "{{", -1)
	str = strings.Replace(buf.String(), "]]", "}}", -1)

	gerr = json.Unmarshal([]byte(str), fill)
	if gerr != nil {
		return nerr.Translate(gerr).Addf("failed to add template")
	}

	return nil
}
