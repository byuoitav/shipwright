package store

type PersistConfig struct {
	PersistResolvedAlerts AlertPersistConfig `json:"persist-resolved-alerts"`
	PersistActiveAlerts   AlertPersistConfig `json:"persist-active-alerts"`
}

type PersistType string

type AlertPersistConfig struct {
	PersistType PersistType `json:"type"`

	//User, Address, and Pass can be passed as a env variable by prepending the environment-variable name with ENV:
	Address string `json:"addr"`
	User    string `json:"user"`
	Pass    string `json:"pass"`

	ElkData ElkPersistConfig //only used for PersistType ELK
}

type ELKPersistConfig struct {
	Index string `json:"index"`
}
