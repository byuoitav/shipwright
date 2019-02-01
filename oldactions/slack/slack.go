package slack

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"reflect"
	"sync"
	"time"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/shipwright/actions/action"
)

const (
	slackurl = "https://hooks.slack.com/services/"

	messageFrequency = 5 * time.Second
)

var (
	proxyURL *url.URL

	once           sync.Once
	attachmentChan chan Attachment
)

func init() {
	var err error

	proxyS := os.Getenv("PROXY_ADDR")
	if len(proxyS) == 0 {
		return
	}

	proxyURL, err = url.Parse(proxyS)
	if err != nil {
		log.L.Fatalf("Failed to parse PROXY_ADDR: %s", err)
	}
}

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
