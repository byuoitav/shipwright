package actions

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
)

// ActionConfig manages the configuration of actions
type ActionConfig struct {
	DB      string
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
		dir := os.Getenv("ACTION_CONFIG_DIR")
		if len(dir) < 1 {
			dir = "./actions/config"
		}

		var err *nerr.E
		defaultConfig, err = NewActionConfig(dir)
		if err != nil {
			log.L.Fatalf("unable to load default action configuration: %s", err.Error())
		}
	})

	return defaultConfig
}

// NewActionConfig creates a new action manager and starts it
func NewActionConfig(db string) (*ActionConfig, *nerr.E) {
	config := &ActionConfig{
		DB: db,
	}

	log.L.Infof("Getting action configuration from couch database %s", config.DB)

	err := filepath.Walk(config.Dir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// skip dirs
		if info.IsDir() {
			return nil
		}

		if strings.Contains(path, "ignore") {
			log.L.Infof("Ignoring actions in file %s", path)
		}

		// attempt to parse every file
		log.L.Debugf("parsing action config file: %s", path)
		b, err := ioutil.ReadFile(path)
		if err != nil {
			return err
		}

		if len(b) == 0 {
			log.L.Infof("Skipping empty action config file %s", path)
			return nil
		}

		var actions []*Action
		err = json.Unmarshal(b, &actions)
		if err != nil {
			return err
		}

		if len(actions) == 0 {
			log.L.Infof("Skipping empty action config file %s", path)
			return nil
		}

		// print out their names
		for i := range actions {
			log.L.Debugf("Added action '%s' from %s", actions[i].Name, path)
		}

		// add those actions to the main list
		config.Actions = append(config.Actions, actions...)
		return nil
	})
	if err != nil {
		return nil, nerr.Translate(err).Addf("unable to read action configs")
	}

	log.L.Infof("Loaded %v actions from %s", len(config.Actions), config.Dir)
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
