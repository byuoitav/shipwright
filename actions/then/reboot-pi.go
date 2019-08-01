package then

import (
	"context"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	"go.uber.org/zap"
)

const (
	// RebootFrequency .
	RebootFrequency = 5 * time.Minute
)

// RebootInfo .
type RebootInfo struct {
	DeviceID   string `json:"deviceID"`
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
	log := log.L.Named("reboot-manager")
	log.Infof("Starting reboot manager. Attempting reboots every %v", RebootFrequency)

	rebootMap := make(map[string]bool)

	ticker := time.NewTicker(SlackMessageFrequency)
	var rebootList []RebootInfo

	for {
		select {
		case info := <-rebootChan:
			log.Infof("Hey at least I'm here: %v", info.DeviceID)
			rebootList = append(rebootList, info)
		case <-ticker.C:
			if rebootList == nil || len(rebootList) == 0 {
				continue
			}

			//The hour numbers mean that the pi won't reboot if the hour (in UTC) is less than 6 or greater than 10
			if time.Now().Hour() < 6 || time.Now().Hour() > 10 {
				rebootMap = make(map[string]bool)
				continue
			}

			for _, rebootInfo := range rebootList {
				log.Infof("attempting to reboot: %s", rebootInfo.DeviceID)
				if _, rebooted := rebootMap[rebootInfo.DeviceID]; !rebooted {
					go reboot(rebootInfo, log)
				}
				rebootMap[rebootInfo.DeviceID] = true
			}
		}
	}
}

//Hit the reboot pi endpoint on the Device Monitoring Microservice
func reboot(r RebootInfo, log *zap.SugaredLogger) {
	log.Infof("rebooting: %v", r.DeviceID)

	dev, err := db.GetDB().GetDevice(r.DeviceID)
	if err != nil {
		log.Warnf("Couldn't get device record: %v", err)
		return
	}
	req, err := http.NewRequest("PUT", fmt.Sprintf("http://%v:10000/device/reboot", dev.Address), nil)
	if err != nil {
		log.Warnf("Couldn't make request: %v", err)
		return
	}
	client := &http.Client{}
	_, err = client.Do(req)
	if err != nil {
		log.Warnf("Couldn't reboot pi: %v", err)
		return
	}
}
