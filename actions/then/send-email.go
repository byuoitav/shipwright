package then

import (
	"context"
	"fmt"
	"net/smtp"

	"github.com/byuoitav/common/nerr"
	"go.uber.org/zap"
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
func SendEmail(ctx context.Context, with []byte, log *zap.SugaredLogger) *nerr.E {
	email := Email{}
	err := FillStructFromTemplate(ctx, string(with), &email)
	if err != nil {
		return err.Addf("failed to send email")
	}

	// send the email
	var gerr error
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
