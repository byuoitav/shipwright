package elk

import (
	"github.com/byuoitav/common/state/statedefinition"
	"github.com/byuoitav/common/structs"
)

type UpdateHeader struct {
	ID    string `json:"_id,omitempty"`
	Type  string `json:"_type,omitemtpy"`
	Index string `json:"_index,omitempty"`
}

type DeviceUpdateInfo struct {
	Info string `json:"Info"`
	Name string `json:"Name"`
}

type UpdateBody struct {
	Doc    map[string]interface{} `json:"doc"`
	Upsert bool                   `json:"doc_as_upsert"`
}

type Alert struct {
	Message   string `json:"message,omitempty"`
	AlertSent string `json:"alert-sent,omitempty"`
	Alerting  bool   `json:"alerting,omitempty"`
	Suppress  bool   `json:"Suppress,omitempty"`
}

type StaticDeviceQueryResponse struct {
	Hits struct {
		Wrappers []struct {
			ID     string                       `json:"_id"`
			Device statedefinition.StaticDevice `json:"_source"`
		} `json:"hits"`
	} `json:"hits"`
}

type StaticRoomQueryResponse struct {
	Hits struct {
		Wrappers []struct {
			ID   string                     `json:"_id"`
			Room statedefinition.StaticRoom `json:"_source"`
		} `json:"hits"`
	} `json:"hits"`
}
type AlertQueryResponse struct {
	Hits struct {
		Wrappers []struct {
			ID    string        `json:"_id"`
			Alert structs.Alert `json:"_source"`
		} `json:"hits"`
	} `json:"hits"`
}

type GenericQuery struct {
	Query map[string]interface{} `json:"query,omitempty"`
	From  int                    `json:"from,omitempty"`
	Size  int                    `json:"size,omitempty"`
}
