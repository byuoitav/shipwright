package then

import (
	"context"
	"sync"
	"time"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	"github.com/nlopes/slack"
	"go.uber.org/zap"
)

const (
	// SlackMessageFrequency .
	SlackMessageFrequency = 4 * time.Second
)

// SlackMessage .
type SlackMessage struct {
	URL        string           `json:"url"`
	Attachment slack.Attachment `json:"attachment"`
}

var (
	once        sync.Once
	messageChan chan SlackMessage
)

// SendSlack sends a slack message
func SendSlack(ctx context.Context, with []byte, log *zap.SugaredLogger) *nerr.E {
	log.Infof("Sending slack message")

	// start the slack message manager
	once.Do(func() {
		messageChan = make(chan SlackMessage, 1000)
		go startSlackManager(messageChan)
	})

	message := SlackMessage{}
	err := FillStructFromTemplate(ctx, string(with), &message)
	if err != nil {
		return err.Addf("unable to send slack message")
	}

	if messageChan == nil {
		return nerr.Createf("error", "unable to send slack message: messageChan does not exist")
	}

	select {
	case messageChan <- message:
		return nil
	case <-ctx.Done():
		return nerr.Createf("error", "unable to send slack message: messageChan is full")
	}
}

func startSlackManager(messageChan chan SlackMessage) {
	log := log.L.Named("slack-manager")
	log.Infof("Starting slack manager. Sending slack messages every %v", SlackMessageFrequency)

	messages := make(map[string][]slack.Attachment)
	ticker := time.NewTicker(SlackMessageFrequency)

	for {
		select {
		case message := <-messageChan:
			messages[message.URL] = append(messages[message.URL], message.Attachment)
		case <-ticker.C:
			if messages == nil || len(messages) == 0 {
				continue
			}

			for url, attachments := range messages {
				// TODO figure out if there is a max number of attachments, and break up the message if it hits that
				log.Infof("Sending %v slack messages to %v", len(attachments), url)

				msg := &slack.WebhookMessage{
					Attachments: attachments,
				}

				err := slack.PostWebhook(url, msg)
				if err != nil {
					log.Warnf("Failed to send slack messages to %v: %s", url, err)
				} else {
					log.Debugf("Successfully send slack messages to %v", url)
					delete(messages, url) // clear out these messages
				}
			}
		}
	}
}
