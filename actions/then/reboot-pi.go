package then

import (
	"context"
	"sync"
	"time"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	"go.uber.org/zap"
)

const (
	// RebootFrequency .
	RebootFrequency = 30 * time.Second
)

// RebootInfo .
type RebootInfo struct {
	DeviceID   string
	RebootTime time.Time
}

var (
	rebootChan chan RebootInfo
	doce       sync.Once
)

// RebootPi reboots a given pi
func RebootPi(ctx context.Context, with []byte, log *zap.SugaredLogger) *nerr.E {
	log.Infof("Rebooting Pi")

	// start the reboot manager
	doce.Do(func() {
		rebootChan = make(chan RebootInfo, 1000)
		go startRebootManager(rebootChan)
	})

	rebootStruct := RebootInfo{}
	err := FillStructFromTemplate(ctx, string(with), &rebootStruct)
	if err != nil {
		return err.Addf("unable to fill reboot struct from template")
	}

	if rebootChan == nil {
		return nerr.Createf("error", "unable to reboot pi: rebootChan does not exist")
	}

	select {
	case rebootChan <- rebootStruct:
		return nil
	case <-ctx.Done():
		return nerr.Createf("error", "unable to reboot pi: rebootChan is full")
	}
}

func startRebootManager(rebootChan chan RebootInfo) {
	log := log.L.Named("Reboot-Manager")
	log.Infof("Starting reboot manager. Attempting reboots every %v", RebootFrequency)

	ticker := time.NewTicker(SlackMessageFrequency)
	var rebootList []RebootInfo

	for {
		select {
		case info := <-rebootChan:
			rebootList = append(rebootList, info)
		case <-ticker.C:
			if rebootList == nil || len(rebootList) == 0 {
				continue
			}

			for _, rebootInfo := range rebootList {
				log.Infof("Attempting to Reboot: %s")

				go reboot(rebootInfo, log)
				/*msg := &slack.WebhookMessage{
					Attachments: attachments,
				}

				err := slack.PostWebhook(url, msg)
				if err != nil {
					log.Warnf("Failed to send slack messages to %v: %s", url, err)
				} else {
					log.Debugf("Successfully send slack messages to %v", url)
					delete(messages, url) // clear out these messages
				}
				*/
			}
		}
	}
}

func reboot(r RebootInfo, log *zap.SugaredLogger) {
	//SSH in and reboot the pi
	log.Infof("Rebooting: %v", r.DeviceID)
}
