package action

import "github.com/byuoitav/common/nerr"

type Payload struct {
	Type    string // type of the alert, found in constants above
	Device  string // the device the alert corresponds to
	Content interface{}
}

type Result struct {
	Payload
	Error *nerr.E
}
