package then

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/smtp"
	"text/template"

	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/shipwright/actions/actionctx"
)

// Email includes information about who to send the email as, auth stuff, etc. etc.
type Email struct {
	From    string   `json:"from"`
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	Body    string   `json:"body"`

	// Attachment stuff (if any)
	Attachment     []byte `json:"attachment"`
	AttachmentName string `json:"attachment-name"`

	// Auth stuff for the SMTP server
	User     string `json:"user"`
	Pass     string `json:"pass"`
	SMTPAddr string `json:"smtp-addr"`
}

// SendEmail sends an email
func SendEmail(ctx context.Context, with []byte) *nerr.E {
	data := templateData{}

	if event, ok := actionctx.GetEvent(ctx); ok {
		data.Event = event
	}

	if dev, ok := actionctx.GetStaticDevice(ctx); ok {
		data.StaticDevice = dev
	}

	// fill the email template
	t, gerr := template.New("email").Parse(string(with))
	if gerr != nil {
		return nerr.Translate(gerr).Addf("failed to add email")
	}

	buf := &bytes.Buffer{}
	gerr = t.Execute(buf, data)
	if gerr != nil {
		return nerr.Translate(gerr).Addf("failed to add email")
	}

	// unmarshal filled template into email struct
	email := Email{}
	gerr = json.Unmarshal(buf.Bytes(), &email)
	if gerr != nil {
		return nerr.Translate(gerr).Addf("failed to add email")
	}

	// send the email
	body := []byte(fmt.Sprintf("Subject: %s\r\n", email.Subject))
	body = append(body, email.Body...)

	if len(email.User) == 0 {
		gerr = smtp.SendMail(email.SMTPAddr, nil, email.From, email.To, body)
	} else {
		auth := smtp.PlainAuth("", email.User, email.Pass, email.SMTPAddr)
		gerr = smtp.SendMail(email.SMTPAddr, auth, email.From, email.To, body)
	}

	if gerr != nil {
		return nerr.Translate(gerr).Addf("unable to send email")
	}

	return nil
}
