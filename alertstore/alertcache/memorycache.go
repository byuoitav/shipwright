package alertcache

import (
	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/structs"
	"github.com/byuoitav/shipwright/alertstore/config"
)

type MemoryAlertCache struct {
	m     map[string]structs.Alert
	index map[string][]string
}

func getMemoryAlertCache(c config.CacheConfig) AlertCache {
	return &MemoryAlertCache{
		m:     map[string]structs.Alert{},
		index: map[string][]string{},
	}
}

func (m *MemoryAlertCache) GetAlert(alertID string) (structs.Alert, *nerr.E) {
	v, ok := m.m[alertID]
	if !ok {
		return v, nerr.Create("Cannot get alert. Alert not found", NotFound)
	}

	return v, nil
}
func (m *MemoryAlertCache) GetAllAlerts() ([]structs.Alert, *nerr.E) {
	v := []structs.Alert{}
	for i := range m.m {
		v = append(v, m.m[i])
	}
	return v, nil
}

func (m *MemoryAlertCache) PutAlert(a structs.Alert) *nerr.E {
	if a.AlertID == "" {
		return nerr.Create("Cannot put alert. Invalid ID", BadID)
	}

	m.m[a.AlertID] = a

	return nil
}

//Delete alert will delete the alert, if present.
func (m *MemoryAlertCache) DeleteAlert(id string) *nerr.E {
	if id == "" {
		return nerr.Create("Cannot delet alert. Invalid ID", BadID)
	}

	delete(m.m, id)

	return nil
}

func (m *MemoryAlertCache) GetAlertsByIndex(IndexID string) ([]string, *nerr.E) {
	v, ok := m.index[IndexID]
	if !ok {
		return v, nerr.Create("Not found", NotFound)
	}

	return v, nil
}

func (m *MemoryAlertCache) AddAlertToIndex(IndexID, AlertID string) *nerr.E {

	alerts, er := m.GetAlertsByIndex(IndexID)
	if er != nil && er.Type != NotFound {
		return er.Addf("Coudln't add alert %v to index %v", AlertID, IndexID)
	}

	for i := range alerts {
		if alerts[i] == AlertID {
			return nil
		}
	}

	//it's not there, lets add it
	alerts = append(alerts, AlertID)

	m.index[IndexID] = alerts

	return nil
}

func (m *MemoryAlertCache) RemoveAlertFromIndex(IndexID, AlertID string) *nerr.E {

	alerts, er := m.GetAlertsByIndex(IndexID)
	if er != nil && er.Type != NotFound {
		return er.Addf("Coudln't remote alert %v from index %v", AlertID, IndexID)
	}

	newAlerts := []string{}
	changes := false

	for i := range alerts {
		if alerts[i] != AlertID {
			newAlerts = append(newAlerts, alerts[i])
		} else {
			changes = true
		}
	}

	if changes {
		m.index[IndexID] = newAlerts
	}
	return nil
}
