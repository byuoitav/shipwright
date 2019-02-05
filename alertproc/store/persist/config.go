package persist

import (
	"encoding/json"
	"io/ioutil"
	"os"

	"github.com/byuoitav/common/log"
)

type PersistConfig struct {
	PersistResolvedAlerts AlertPersistConfig `json:"persist-resolved-alerts"`
	PersistActiveAlerts   AlertPersistConfig `json:"persist-active-alerts"`

	//User, Address, and Pass can be passed as a env variable by prepending the environment-variable name with ENV:
	Address string `json:"addr"`
	User    string `json:"user"`
	Pass    string `json:"pass"`

	UpdateInterval string `json:"update-interval"` //expected in the golang duration format
}

type PersistType string

type AlertPersistConfig struct {
	ElkData ELKPersistConfig `json:"elk"` //only used for PersistType ELK
}

type ELKPersistConfig struct {
	IndexPattern string `json:"index"`
}

func GetConfig() PersistConfig {
	//check for the PERSIST_CONFIG env variable, if blank check for the persist-config.json file
	fileLocation := os.Getenv("PERSIST_CONFIG")
	if len(fileLocation) < 1 {
		fileLocation = "./persist-config.json"
	}

	toReturn := PersistConfig{}
	b, err := ioutil.ReadFile(fileLocation)
	if err != nil {
		log.L.Fatalf("Coudln't read config file %v", fileLocation)
	}

	err = json.Unmarshal(b, &toReturn)
	if err != nil {
		log.L.Fatalf("Coudln't read config file %v", fileLocation)
	}

	return toReturn
}
