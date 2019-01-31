package action

import "github.com/byuoitav/common/nerr"

// Payload contains information about the action to be executed
type Payload struct {
	Type    string // type of the alert, found in constants above
	Device  string // the device the alert corresponds to
	Content interface{}
}

// Result is the result of executing the action
type Result struct {
	Payload
	Error *nerr.E
}
