package helpers

import (
	"fmt"
	"net"

	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/structs"
)

// RecordBulkDeviceChanges takes the responses from calling the CreateBulkDevices database function and makes change records for all of that information
func RecordBulkDeviceChanges(responses []structs.BulkUpdateResponse, username string) []DBResponse {
	var results []DBResponse

	for _, resp := range responses {
		dbRes := DBResponse{
			ObjectID: resp.ID,
			Action:   AddAction,
			Success:  resp.Success,
		}

		if resp.Success {
			dbRes.Message = resp.Message
		} else {
			dbRes.Error = resp.Message
		}

		fakeDevice := structs.Device{ID: resp.ID}

		Master.AddedDevices = append(Master.AddedDevices, CreateDeviceChange(fakeDevice, AddAction, username))

		results = append(results, dbRes)
	}

	return results
}

// AddDevice adds a device to the database
func AddDevice(deviceID string, device structs.Device) (DBResponse, *nerr.E) {
	// build response object
	response := DBResponse{
		ObjectID: deviceID,
		Action:   AddAction,
		Success:  false,
	}

	_, err := db.GetDB().CreateDevice(device)
	if err != nil {
		response.Error = fmt.Sprintf("failed to add the device %s to the database", deviceID)
		return response, nerr.Translate(err).Add(response.Error)
	}

	response.Message = "Device successfully created."

	// return the response
	response.Success = true
	return response, nil
}

// AddBulkDevices adds multiples devices to the database
func AddBulkDevices(devices []structs.Device) []structs.BulkUpdateResponse {
	return db.GetDB().CreateBulkDevices(devices)
}

// UpdateDevice updates a device in the database
func UpdateDevice(deviceID string, device structs.Device) (DBResponse, *nerr.E) {
	// build response object
	response := DBResponse{
		ObjectID: deviceID,
		Action:   UpdateAction,
		Success:  false,
	}

	_, err := db.GetDB().UpdateDevice(deviceID, device)
	if err != nil {
		response.Error = fmt.Sprintf("failed to update the device %s in the database", deviceID)
		return response, nerr.Translate(err).Add(response.Error)
	}

	response.Message = "Device successfully updated."

	// return the response
	response.Success = true
	return response, nil
}

// GetDevice gets a device from the database
func GetDevice(deviceID string) (structs.Device, *nerr.E) {
	device, err := db.GetDB().GetDevice(deviceID)
	if err != nil {
		return device, nerr.Translate(err).Addf("failed to get the device %s", deviceID)
	}

	return device, nil
}

// GetAllDevices gets all devices from the database
func GetAllDevices() ([]structs.Device, *nerr.E) {
	devices, err := db.GetDB().GetAllDevices()
	if err != nil {
		return devices, nerr.Translate(err).Add("failed to get all devices from the database")
	}

	return devices, nil
}

// GetDevicesByRoom gets all the devices in a room
func GetDevicesByRoom(roomID string) ([]structs.Device, *nerr.E) {
	devices, err := db.GetDB().GetDevicesByRoom(roomID)
	if err != nil {
		return devices, nerr.Translate(err).Addf("failed to get all devices in the room %s", roomID)
	}

	return devices, nil
}

// GetDevicesByRoomAndRole gets all the devices in a room with the given role
func GetDevicesByRoomAndRole(roomID, roleID string) ([]structs.Device, *nerr.E) {
	devices, err := db.GetDB().GetDevicesByRoomAndRole(roomID, roleID)
	if err != nil {
		return devices, nerr.Translate(err).Addf("failed to get all devices in %s that have the role %s", roomID, roleID)
	}

	return devices, nil
}

// GetDevicesByTypeAndRole gets all the devices of the given type that have the given role
func GetDevicesByTypeAndRole(typeID, roleID string) ([]structs.Device, *nerr.E) {
	devices, err := db.GetDB().GetDevicesByRoleAndType(roleID, typeID)
	if err != nil {
		return devices, nerr.Translate(err).Addf("failed to get all devices of the type %s that have the role %s", typeID, roleID)
	}

	return devices, nil
}

// DeleteDevice deletes a device from the database
func DeleteDevice(deviceID string) (DBResponse, *nerr.E) {
	// build response object
	response := DBResponse{
		ObjectID: deviceID,
		Action:   DeleteAction,
		Success:  false,
	}

	err := db.GetDB().DeleteDevice(deviceID)
	if err != nil {
		response.Error = fmt.Sprintf("failed to delete the device %s from the database", deviceID)
		return response, nerr.Translate(err).Add(response.Error)
	}

	response.Message = "Device successfully deleted."

	// return the response
	response.Success = true
	return response, nil
}

// GetDeviceTypes gets a list of possible device types
func GetDeviceTypes() ([]structs.DeviceType, *nerr.E) {
	types, err := db.GetDB().GetAllDeviceTypes()
	if err != nil {
		return types, nerr.Translate(err).Add("failed to get all device types")
	}

	return types, nil
}

// GetDeviceRoles gets a list of possible device roles
func GetDeviceRoles() ([]structs.Role, *nerr.E) {
	roles, err := db.GetDB().GetDeviceRoles()
	if err != nil {
		return roles, nerr.Translate(err).Add("failed to get all device roles")
	}

	return roles, nil
}

// GetDeviceRawIPAddress takes a device's hostname and return the IP address associated to it
func GetDeviceRawIPAddress(hostname string) (string, *nerr.E) {
	address := ""

	addrs, err := net.LookupHost(hostname)
	if err != nil {
		return address, nerr.Translate(err).Addf("failed to resolve hostname address %s", hostname)
	}

	if len(addrs) >= 1 {
		address = addrs[0]
	}

	return address, nil
}
