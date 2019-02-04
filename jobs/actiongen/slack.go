package actiongen

import (
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/shipwright/oldactions/action"
	"github.com/byuoitav/shipwright/oldactions/slack"
)

//GenSlackAction .
func GenSlackAction(config Config, i interface{}, device string) (action.Payload, *nerr.E) {
	toReturn := action.Payload{}
	context := slack.Attachment{}
	var er *nerr.E

	context.Title, er = ReplaceParameters(config.Fields["title"], i)
	if er != nil {
		log.L.Debugf("Problem replacing: %v", er.Error())
		return toReturn, er.Addf("Couldn't generate email action")
	}
	context.Text, er = ReplaceParameters(config.Fields["text"], i)
	if er != nil {
		log.L.Debugf("Problem replacing: %v", er.Error())
		return toReturn, er.Addf("Couldn't generate email action")
	}

	return action.Payload{
		Type:    Slack,
		Content: context,
		Device:  device,
	}, nil
}
