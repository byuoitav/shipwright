package actions

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"sync"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
)

// ActionConfig manages the configuration of actions
type ActionConfig struct {
	Path    string
	Actions []*Action
}

var (
	defaultConfig *ActionConfig
	once          sync.Once
)

// DefaultConfig returns the default action configuration
func DefaultConfig() *ActionConfig {
	once.Do(func() {
		// load the default config
		path := os.Getenv("ACTION_CONFIG_LOCATION")
		if len(path) < 1 {
			path = "./action-config.json"
		}

		var err *nerr.E
		defaultConfig, err = NewActionConfig(path)
		if err != nil {
			log.L.Fatalf("unable to load default action configuration: %s", err.Error())
		}
	})

	return defaultConfig
}

// NewActionConfig creates a new action manager and starts it
func NewActionConfig(path string) (*ActionConfig, *nerr.E) {
	config := &ActionConfig{
		Path: path,
	}

	log.L.Infof("Parsing action configuration from %s", path)
	b, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, nerr.Translate(err).Addf("unable to read action configuration")
	}

	err = json.Unmarshal(b, &config.Actions)
	if err != nil {
		return nil, nerr.Translate(err).Addf("unable to unmarshal action configuration")
	}

	return config, nil
}

// GetActionsByTrigger returns all actions with the specified trigger
func (c *ActionConfig) GetActionsByTrigger(trigger string) []*Action {
	ret := []*Action{}
	for i := range c.Actions {
		if c.Actions[i].Trigger == trigger {
			ret = append(ret, c.Actions[i])
		}
	}

	return ret
}
