package config

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"sync"

	"github.com/byuoitav/common/log"
)

var once sync.Once

var c Config

const (
	//Couch .
	Couch = "couch"
	//Elk  .
	Elk = "elk"
)

const (
	//Room .
	Room = "room"

	//Device .
	Device = "device"
)

//Config .
type Config struct {
	Forwarders []Forwarder `json:"forwarders"`
	Caches     []Cache     `json:"caches"`
}

var config Config

func init() {
	//if no one else does, get the config
	GetConfig()
}

//GetConfig .
func GetConfig() Config {
	once.Do(func() {
		// parse configuration
		path := os.Getenv("SERVICE_CONFIG_LOCATION")
		if len(path) < 1 {
			path = "./service-config.json"
		}
		log.L.Infof("Parsing job configuration from: %s", path)

		// read job configuration
		b, err := ioutil.ReadFile(path)
		if err != nil {
			log.L.Fatalf("failed to read job configuration: %s", err)
		}

		// unmarshal job config
		err = json.Unmarshal(b, &config)
		if err != nil {
			log.L.Fatalf("failed to parse job configuration: %s", err)
		}
	})

	return config
}

//Contains .
func Contains(a []string, b string) bool {
	for i := range a {
		if a[i] == b {
			return true
		}
	}

	return false
}
