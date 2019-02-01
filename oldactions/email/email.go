package email

import (
	"fmt"
	"net/smtp"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/shipwright/actions/action"
)

//Action ..
type Action struct {
}

//Info includes information about who to send the email as, auth stuff, etc. etc.
type Info struct {
	Subject string
	Body    string

	//Attachment stuff (if any)
	Attachment     []byte
	AttachmentName string

	Sender    string   //who to send the e-mail as
	Receivers []string //who to send the e-mail to

	SMTPAddr string

	//Auth stuff for the SMTP server
	User string
	Pass string
}

//Execute .
func (a *Action) Execute(in action.Payload) action.Result {
	v, ok := in.Content.(Info)
	if !ok {
		return action.Result{
			Payload: in,
			Error:   nerr.Create("Bad action payload...", "invalid-payload"),
		}
	}
	body := []byte(fmt.Sprintf("Subject: %s\r\n", v.Subject))
	body = append(body, v.Body...)
	var err error

	if len(v.User) != 0 {
		auth := smtp.PlainAuth("", v.User, v.Pass, v.SMTPAddr)
		err = smtp.SendMail(v.SMTPAddr, auth, v.Sender, v.Receivers, body)
	} else {
		err = smtp.SendMail(v.SMTPAddr, nil, v.Sender, v.Receivers, body)
	}
	if err != nil {
		log.L.Warnf("Problem sending the e-mail: %v", err.Error())
		return action.Result{
			Payload: in,
			Error:   nerr.Translate(err).Addf("Couldn't send mail."),
		}
	}

	return action.Result{}
}
