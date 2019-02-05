package then

import (
	"bytes"
	"context"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"sync"
	"time"

	logger "github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	"go.uber.org/zap"
)

const (
	slackurl = "https://hooks.slack.com/services/"
)

type slackAttachment struct {
	Fallback  string            `json:"fallback,omitempty"`
	Pretext   string            `json:"pretext,omitempty"`
	Title     string            `json:"title,omitempty"`
	TitleLink string            `json:"title_link,omitempty"`
	Text      string            `json:"text,omitempty"`
	Color     string            `json:"color,omitempty"`
	Fields    []slackAlertField `json:"fields,omitempty"`
}

type slackAlertField struct {
	Title string `json:"title,omitemtpy"`
	Value string `json:"value,omitemtpy"`
	Short bool   `json:"short,omitemtpy"`
}

type slackAlert struct {
	Attachments []slackAttachment `json:"attachments,omitempty"`
	Markdown    bool              `json:"mrkdwn"`
	Text        string            `json:"text,omitempty"`
}

type slackClient struct {
	MessageFrequency time.Duration
	ProxyURL         *url.URL

	AttachmentChan chan slackAttachment
}

var (
	once   sync.Once
	client *slackClient
)

// SendSlack sends a slack message
func SendSlack(ctx context.Context, with []byte, log *zap.SugaredLogger) *nerr.E {
	log.Infof("Sending slack message")

	once.Do(func() {
		// build the slack client
		proxy := os.Getenv("PROXY_ADDR")
		if len(proxy) == 0 {
			logger.L.Warnf("no PROXY_ADDR set. Slack messages may be unable to send.")
		}

		proxyURL, err := url.Parse(proxy)
		if err != nil {
			logger.L.Errorf("PROXY_ADDR is an invalid url: %s", err)
		}

		client = &slackClient{
			MessageFrequency: 5 * time.Second,
			ProxyURL:         proxyURL,
			AttachmentChan:   make(chan slackAttachment, 10),
		}

		// start the slack client
		go client.Start()
	})

	attachment := slackAttachment{}
	err := fillStructFromTemplate(ctx, string(with), &attachment)
	if err != nil {
		return err.Addf("failed to send slack")
	}

	client.AttachmentChan <- attachment
	return nil
}

func (c *slackClient) Start() {
	log := logger.L.Named("slack-client")
	log.Infof("Starting slack client. Sending slack messages every %v", c.MessageFrequency)

	ticker := time.NewTicker(c.MessageFrequency)
	attachments := []slackAttachment{}
	client := &http.Client{
		Timeout: 20 * time.Second,
	}

	// set proxy url
	if c.ProxyURL != nil {
		client.Transport = &http.Transport{
			Proxy: http.ProxyURL(c.ProxyURL),
		}
	}

	for {
		select {
		case attachment := <-c.AttachmentChan:
			attachments = append(attachments, attachment)
		case <-ticker.C:
			if attachments == nil || len(attachments) == 0 {
				continue
			}

			log.Infof("Sending %v slack alert(s)", len(attachments))

			msg := slackAlert{
				Markdown:    false,
				Attachments: attachments,
			}

			// clear these attachments
			attachments = nil

			body, err := json.Marshal(msg)
			if err != nil {
				log.Errorf("unable to marshal slack request: %s", err)
				continue
			}

			endpoint := "T0311JJTE/B6Y0R5GDN/mvsN2fYUsfFQw6UfPStJo4wZ"

			// TODO somehow have a way to send to a different channel
			req, err := http.NewRequest(http.MethodPost, slackurl+endpoint, bytes.NewReader(body))
			if err != nil {
				log.Errorf("unable to build slack request: %s", err)
				continue
			}

			req.Header.Add("content-type", "application/json")

			resp, err := client.Do(req)
			if err != nil {
				log.Warnf("unable to send slack request: %s", err)
				continue
			}
			defer resp.Body.Close()

			if resp.StatusCode/100 != 2 {
				b, err := ioutil.ReadAll(resp.Body)
				if err != nil {
					log.Warnf("%v status code & unable to read response body from sending slack alert: %s", resp.StatusCode, err)
					continue
				}

				log.Warnf("%v status code response from sending slack alerts. response body: %s", resp.StatusCode, b)
				continue
			}

			log.Infof("Successfully sent slack alerts")
		}
	}
}
