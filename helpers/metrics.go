package helpers

import (
	"encoding/json"
	"strings"
	"time"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/structs"
)

// ChangeMaster has all of the changed information
type ChangeMaster struct {
	AddedBuildings   []MetricsResponse `json:"added_buildings,omitempty"`
	AddedRooms       []MetricsResponse `json:"added_rooms,omitempty"`
	AddedDevices     []MetricsResponse `json:"added_devices,omitempty"`
	AddedUIConfigs   []MetricsResponse `json:"added_uiconfigs,omitempty"`
	UpdatedBuildings []MetricsResponse `json:"updated_buildings,omitempty"`
	UpdatedRooms     []MetricsResponse `json:"updated_rooms,omitempty"`
	UpdatedDevices   []MetricsResponse `json:"updated_devices,omitempty"`
	UpdatedUIConfigs []MetricsResponse `json:"updated_uiconfigs,omitempty"`
	DeletedBuildings []MetricsResponse `json:"deleted_buildings,omitempty"`
	DeletedRooms     []MetricsResponse `json:"deleted_rooms,omitempty"`
	DeletedDevices   []MetricsResponse `json:"deleted_devices,omitempty"`
	DeletedUIConfigs []MetricsResponse `json:"deleted_uiconfigs,omitempty"`
}

// Master is the instantiation of the master list of changes
var Master ChangeMaster

func init() {
	Master.AddedBuildings = make([]MetricsResponse, 0)
	Master.AddedRooms = make([]MetricsResponse, 0)
	Master.AddedDevices = make([]MetricsResponse, 0)
	Master.AddedUIConfigs = make([]MetricsResponse, 0)
	Master.UpdatedBuildings = make([]MetricsResponse, 0)
	Master.UpdatedRooms = make([]MetricsResponse, 0)
	Master.UpdatedDevices = make([]MetricsResponse, 0)
	Master.UpdatedUIConfigs = make([]MetricsResponse, 0)
	Master.DeletedBuildings = make([]MetricsResponse, 0)
	Master.DeletedRooms = make([]MetricsResponse, 0)
	Master.DeletedDevices = make([]MetricsResponse, 0)
	Master.DeletedUIConfigs = make([]MetricsResponse, 0)
}

// CreateBuildingChange takes a Building and the type of action and builds a MetricsResponse
func CreateBuildingChange(building structs.Building, action, username string) MetricsResponse {
	toReturn := MetricsResponse{
		ObjectID:  building.ID,
		Action:    action,
		Username:  username,
		Timestamp: time.Now().Format(time.UnixDate),
	}

	if strings.EqualFold(action, UpdateAction) {
		// detect changes
	}

	return toReturn
}

// CreateAndAddBuildingChange takes a Building and the type of action and the username and builds a MetricsResponse, and then adds that to the Master
func CreateAndAddBuildingChange(building structs.Building, action, username string) {
	mResponse := MetricsResponse{
		ObjectID:  building.ID,
		Action:    action,
		Username:  username,
		Timestamp: time.Now().Format(time.UnixDate),
	}

	if strings.EqualFold(action, UpdateAction) {
		// detect changes

		// record the change
		Master.UpdatedBuildings = append(Master.UpdatedBuildings, mResponse)
		return
	}

	Master.AddedBuildings = append(Master.AddedBuildings, mResponse)
	return
}

// CreateRoomChange takes a Room and the type of action and builds a MetricsResponse
func CreateRoomChange(room structs.Room, action, username string) MetricsResponse {
	toReturn := MetricsResponse{
		ObjectID:  room.ID,
		Action:    action,
		Username:  username,
		Timestamp: time.Now().Format(time.UnixDate),
	}

	if strings.EqualFold(action, UpdateAction) {
		// detect changes
	}

	return toReturn
}

// CreateAndAddRoomChange takes a Room and the type of action and builds a MetricsResponse
func CreateAndAddRoomChange(room structs.Room, action, username string) {
	mResponse := MetricsResponse{
		ObjectID:  room.ID,
		Action:    action,
		Username:  username,
		Timestamp: time.Now().Format(time.UnixDate),
	}

	if strings.EqualFold(action, UpdateAction) {
		// detect changes

		// record the change
		Master.UpdatedRooms = append(Master.UpdatedRooms, mResponse)
		return
	}

	Master.AddedRooms = append(Master.AddedRooms, mResponse)
	return
}

// CreateDeviceChange takes a Device and the type of action and builds a MetricsResponse
func CreateDeviceChange(device structs.Device, action, username string) MetricsResponse {
	toReturn := MetricsResponse{
		ObjectID:  device.ID,
		Action:    action,
		Username:  username,
		Timestamp: time.Now().Format(time.UnixDate),
	}

	if strings.EqualFold(action, UpdateAction) {
		// detect changes
	}

	return toReturn
}

// CreateAndAddDeviceChange takes a Device and the type of action and builds a MetricsResponse
func CreateAndAddDeviceChange(device structs.Device, action, username string) {
	mResponse := MetricsResponse{
		ObjectID:  device.ID,
		Action:    action,
		Username:  username,
		Timestamp: time.Now().Format(time.UnixDate),
	}

	if strings.EqualFold(action, UpdateAction) {
		// detect changes

		// record the change
		Master.UpdatedDevices = append(Master.UpdatedDevices, mResponse)
		return
	}

	Master.AddedDevices = append(Master.AddedDevices, mResponse)
	return
}

// CreateUIConfigChange takes a UIConfig and the type of action and builds a MetricsResponse
func CreateUIConfigChange(config structs.UIConfig, action, username string) MetricsResponse {
	toReturn := MetricsResponse{
		ObjectID:  config.ID,
		Action:    action,
		Username:  username,
		Timestamp: time.Now().Format(time.UnixDate),
	}

	if strings.EqualFold(action, UpdateAction) {
		// detect changes
	}

	return toReturn
}

// CreateAndAddUIConfigChange takes a UIConfig and the type of action and builds a MetricsResponse
func CreateAndAddUIConfigChange(config structs.UIConfig, action, username string) {
	mResponse := MetricsResponse{
		ObjectID:  config.ID,
		Action:    action,
		Username:  username,
		Timestamp: time.Now().Format(time.UnixDate),
	}

	if strings.EqualFold(action, UpdateAction) {
		// detect changes

		// record the change
		Master.UpdatedUIConfigs = append(Master.UpdatedUIConfigs, mResponse)
		return
	}

	Master.AddedUIConfigs = append(Master.AddedUIConfigs, mResponse)
	return
}

// Print prints out the data contained in the ChangeMaster
func (CM *ChangeMaster) Print() {
	b, err := json.Marshal(CM)
	if err != nil {
		log.L.Error("failed to marshal the change list")
		return
	}

	log.L.Warn(string(b))
}

// PrettyPrint prints an indented version of the data contained in the ChangeMaster
func (CM *ChangeMaster) PrettyPrint() {
	b, err := json.MarshalIndent(CM, "", "    ")
	if err != nil {
		log.L.Error("failed to marshal the change list")
		return
	}

	log.L.Warn(string(b))
}
