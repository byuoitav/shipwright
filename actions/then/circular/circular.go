package circular

import "github.com/byuoitav/shipwright/actions/then"

func init() {
	then.Add("add-alert", AddAlert)
	then.Add("add-action", AddAction)
}
