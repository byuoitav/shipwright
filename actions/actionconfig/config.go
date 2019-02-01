package actionconfig

import (
	"encoding/json"
	"io/ioutil"
	"os"

	"github.com/byuoitav/common/log"
)

var (
	actions []Action
)

func init() {
	path := os.Getenv("ACTION_CONFIG_LOCATION")
	if len(path) < 1 {
		path = "./action-config.json"
	}

	log.L.Infof("Parsing action configuration from %s", path)

	// read action config
	b, err := ioutil.ReadFile(path)
	if err != nil {
		log.L.Fatalf("failed to read action configuration: %s", err)
	}

	// unmarshal job config
	err = json.Unmarshal(b, &config)
	if err != nil {
		log.L.Fatalf("failed to parse job configuration: %s", err)
	}
}

// LoadConfiguration .
func LoadConfiguration() {
}
