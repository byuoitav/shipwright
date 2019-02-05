package actiongen

import (
	"fmt"
	"strings"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/shipwright/oldactions/action"
	"github.com/byuoitav/shipwright/oldactions/email"
)

//EmailRequiredFields required fields
var EmailRequiredFields = map[string]string{
	"recipients": "Comma separated strings. Recipients for the e-mail",
	"sender":     "String. The sender of the e-mail",
	"user":       "string. The user to authenticate with the SMTP server. Leave blank if no auth.",
	"pass":       "string. The password to authenticate with the SMTP server. Leave blank if no auth.",
	"subject":    "string. The subject of the e-mail to send",
	"body":       "string. The body to send.",
	"smtp-addr":  "The SMTP server address/port to use.",
}

//GenEmailAction .
func GenEmailAction(config Config, i interface{}, device string) (action.Payload, *nerr.E) {
	toReturn := action.Payload{}

	//check the fields
	er := CheckFields(EmailRequiredFields, config)
	if er != nil {
		return toReturn, er.Addf("Couldn't generate email action")
	}

	//do the thing.
	context := email.Info{}
	context.Subject, er = ReplaceParameters(config.Fields["subject"], i)
	if er != nil {
		log.L.Debugf("Problem replacing: %v", er.Error())
		return toReturn, er.Addf("Couldn't generate email action")
	}
	context.Sender, er = ReplaceParameters(config.Fields["sender"], i)
	if er != nil {
		log.L.Debugf("Problem replacing: %v", er.Error())
		return toReturn, er.Addf("Couldn't generate email action")
	}
	context.User, er = ReplaceParameters(config.Fields["user"], i)
	if er != nil {
		log.L.Debugf("Problem replacing: %v", er.Error())
		return toReturn, er.Addf("Couldn't generate email action")
	}
	context.Pass, er = ReplaceParameters(config.Fields["pass"], i)
	if er != nil {
		log.L.Debugf("Problem replacing: %v", er.Error())
		return toReturn, er.Addf("Couldn't generate email action")
	}
	context.Subject, er = ReplaceParameters(config.Fields["subject"], i)
	if er != nil {
		log.L.Debugf("Problem replacing: %v", er.Error())
		return toReturn, er.Addf("Couldn't generate email action")
	}
	context.Body, er = ReplaceParameters(config.Fields["body"], i)
	if er != nil {
		log.L.Debugf("Problem replacing: %v", er.Error())
		return toReturn, er.Addf("Couldn't generate email action")
	}
	context.SMTPAddr, er = ReplaceParameters(config.Fields["smtp-addr"], i)
	if er != nil {
		log.L.Debugf("Problem replacing: %v", er.Error())
		return toReturn, er.Addf("Couldn't generate email action")
	}

	rec, er := ReplaceParameters(config.Fields["recipients"], i)
	if er != nil {
		log.L.Debugf("Problem replacing: %v", er.Error())
		return toReturn, er.Addf("Couldn't generate email action")
	}

	for _, i := range strings.Split(rec, ",") {
		context.Receivers = append(context.Receivers, i)
	}

	return action.Payload{
		Type:    Email,
		Content: context,
		Device:  device,
	}, nil
}

//CheckFields .
func CheckFields(r map[string]string, c Config) *nerr.E {
	missing := []string{}
	for k := range r {
		if _, ok := c.Fields[k]; !ok {
			missing = append(missing, k)
		}
	}
	if len(missing) == 0 {
		return nil
	}

	return nerr.Create(fmt.Sprintf("Not all needed fields, missing fields: %v", missing), "bad-config")
}
