package store

type PersistConfig struct {
	PersistResolvedAlerts AlertPersistConfig `json:"persist-resolved-alerts"`
	PersistActiveAlerts   AlertPersistConfig `json:"persist-active-alerts"`

	PersistType PersistType `json:"type"`

	//User, Address, and Pass can be passed as a env variable by prepending the environment-variable name with ENV:
	Address string `json:"addr"`
	User    string `json:"user"`
	Pass    string `json:"pass"`

	UpdateInterval string `json:"update-interval"` //expected in the golang duration format
}

type PersistType string

type AlertPersistConfig struct {
	ElkData ELKPersistConfig //only used for PersistType ELK
}

type ELKPersistConfig struct {
	IndexPattern string `json:"index"`
}
