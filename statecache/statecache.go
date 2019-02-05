package statecache

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"os"
	"time"

	"github.com/byuoitav/central-event-system/messenger"
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/state-parser/config"
	"github.com/byuoitav/state-parser/state/cache"
)

var mess *messenger.Messenger

func init() {
	var err *nerr.E
	mess, err = messenger.BuildMessenger(os.Getenv("HUB_ADDRESS"), "messenger", 1000)
	if err != nil {
		//eventually we want to register a retry and continue
		log.L.Fatal("Couldn't build messenger")
	}

	mess.SubscribeToRooms("ITB-1010")

	tmpcache := config.Cache{
		Name:        "test",
		StorageType: config.Elk,
		CacheType:   "default",
		ELKinfo: config.ElkCache{
			DeviceIndex: "oiv-static-av-devices-v2",
			URL:         "http://av-elk-rapidmaster1:9200",
		},
	}

	cache.InitializeCaches([]config.Cache{tmpcache}, nil)

	go startMessenger()

	go func() {
		t := time.NewTicker(5 * time.Second)
		for {
			<-t.C
			PrintCache()
		}
	}()
}

func startMessenger() {

	client := http.Client{
		Timeout: 1 * time.Second,
	}

	for {
		ev := mess.ReceiveEvent()
		cache.GetCache("default").StoreAndForwardEvent(ev)

		b, _ := json.Marshal(ev)
		resp, err := client.Post("http://localhost:10011/v2/event", "application/json", bytes.NewBuffer(b))
		if err != nil {
			log.L.Errorf("%v", err.Error())
		}
		b, err = ioutil.ReadAll(resp.Body)
		if err != nil {
			log.L.Errorf("%v", err.Error())
		}
		log.L.Debugf("Response from state parser: %s", b)
	}
}

//PrintCache .
func PrintCache() {
	recs, err := cache.GetCache("default").GetAllDeviceRecords()
	if err != nil {
		log.L.Errorf("%v", err.Error())
	}

	for i := range recs {
		log.L.Debugf("%+v", recs[i])
	}
}
