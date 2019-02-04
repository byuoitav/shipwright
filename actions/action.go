package actions

import "github.com/byuoitav/shipwright/actions/then"

// Action represents an action to be executed based on some conditions
type Action struct {
	Trigger string      `json:"trigger"`
	If      If          `json:"if"`
	Then    []then.Then `json:"then"`
}

// IfThen checks the 'ifs' of the action and if they all pass, then it runs the 'thens'
func (a *Action) IfThen() {
}
