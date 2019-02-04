package then

import (
	"context"
	"net/url"
	"sync"
	"time"

	"github.com/byuoitav/common/nerr"
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
	attachmentChan   chan slackAttachment
}

var (
	once sync.Once
)

/*
func init() {
	// var err error

	proxyS := os.Getenv("PROXY_ADDR")
	if len(proxyS) == 0 {
		return
	}

	/*
		proxyURL, err = url.Parse(proxyS)
		if err != nil {
			log.L.Fatalf("Failed to parse PROXY_ADDR: %s", err)
		}
}
*/

// SendSlack sends a slack message
func SendSlack(ctx context.Context, with []byte) *nerr.E {
	once.Do(func() {
	})

	return nil
}

/*
type Action struct {
	ChannelIdentifier string
}

func (s *Action) Execute(a action.Payload) action.Result {
	once.Do(func() {
		startSlackManager(s.ChannelIdentifier)
	})

	result := action.Result{
		Payload: a,
	}

	attachment, ok := a.Content.(Attachment)
	if !ok {
		result.Error = nerr.Create("action content was not a slack attachment.", reflect.TypeOf("").String())
	}

	attachmentChan <- attachment

	log.L.Debugf("Successfully queued slack alert for %s.", a.Device)
	return result
}

func startSlackManager(channelIdentifier string) {
	log.L.Infof("Starting slack action manager. Sending alerts every %v.", messageFrequency)
	ticker := time.NewTicker(messageFrequency)
	attachmentChan = make(chan Attachment, 300)

	var attachments []Attachment

	var client *http.Client
	if proxyURL != nil {
		// pretty simple, just a post, the only thing that could be an issue is the proxies
		client = &http.Client{Transport: &http.Transport{Proxy: http.ProxyURL(proxyURL)}, Timeout: 3 * time.Second}
	} else {
		client = &http.Client{Timeout: 3 * time.Second}
	}

	go func() {
		for {
			select {
			case attachment := <-attachmentChan:
				attachments = append(attachments, attachment)
			case <-ticker.C:
				if attachments == nil {
					log.L.Debugf("No slack alerts to send.")
					continue
				}

				log.L.Infof("Sending off %v slack alerts.", len(attachments))

				// build the message
				msg := alert{
					Markdown:    false,
					Attachments: attachments,
				}

				// clear attachments
				attachments = nil

				reqBody, err := json.Marshal(msg)
				if err != nil {
					log.L.Errorf("failed to marshal slack request: %s", err)
					continue
				}

				req, err := http.NewRequest(http.MethodPost, slackurl+channelIdentifier, bytes.NewReader(reqBody))
				if err != nil {
					log.L.Errorf("failed to build request to send slack alerts: %s", err)
					continue
				}
				req.Header.Add("content-type", "application/json")

				resp, err := client.Do(req)
				if err != nil {
					log.L.Warnf("failed to send slack alerts: %s", err)
					continue
				}
				defer resp.Body.Close()

				b, err := ioutil.ReadAll(resp.Body)
				if err != nil {
					log.L.Warnf("failed to read response body after sending slack alert: %s", err)
					continue
				}

				if resp.StatusCode/100 != 2 {
					log.L.Warnf("bad status code response from slack alert: %v. body: %s", resp.StatusCode, b)
					continue
				}

				log.L.Infof("Successfully sent slack alerts.")
			}
		}
	}()
}
*/
