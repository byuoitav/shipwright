package helpers

import "github.com/byuoitav/common/state/statedefinition"

// A list of actions to be used in reporting
const (
	AddAction    = "add"
	UpdateAction = "update"
	DeleteAction = "delete"
)

// A list of tags for logging
const (
	BuildingsTag = "[buildings]"
	RoomsTag     = "[rooms]"
	DevicesTag   = "[devices]"
	UIConfigsTag = "[uiconfigs]"
	OptionsTag   = "[options]"
	AlertsTag    = "[alerts]"
	MetricsTag   = "[metrics]"
	StaticTag    = "[static]"
)

// DBResponse contains the information to be reported back upon changes being made to the database
type DBResponse struct {
	ObjectID string `json:"object_id"`
	Action   string `json:"action"`
	Success  bool   `json:"success"`
	Message  string `json:"message,omitempty"`
	Error    string `json:"error,omitempty"`
}

// MetricsResponse contains the information to be reported back when asked for metrics data
type MetricsResponse struct {
	ObjectID  string         `json:"object_id"`
	Action    string         `json:"action"`
	Username  string         `json:"username"`
	Timestamp string         `json:"timestamp"`
	Changes   []ChangeRecord `json:"changes,omitempty"`
}

// ChangeRecord contains the information about what was changed about the object when it was updated
type ChangeRecord struct {
	AttributeName string `json:"attribute_name"`
	OldValue      string `json:"old_value"`
	NewValue      string `json:"new_value"`
}

// BuildingStatus contains information about the status of a building
type BuildingStatus struct {
	BuildingID        string                `json:"building-id"`
	RoomCount         int                   `json:"room-count"`
	AlertingRoomCount int                   `json:"alerting-room-count"`
	GoodRoomCount     int                   `json:"good-room-count"`
	RoomStates        map[string]RoomStatus `json:"room-states,omitempty"`
}

// RoomStatus contains information about the status of a room
type RoomStatus struct {
	RoomID              string                           `json:"room-id"`
	DeviceCount         int                              `json:"device-count"`
	AlertingDeviceCount int                              `json:"alerting-device-count"`
	GoodDeviceCount     int                              `json:"good-device-count"`
	Alerts              map[string]statedefinition.Alert `json:"alerts"`
	DeviceStates        []statedefinition.StaticDevice   `json:"device-states,omitempty"`
}
