package handlers

import (
	"fmt"
	"net"
	"net/http"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/structs"
	"github.com/byuoitav/shipwright/helpers"
	"github.com/labstack/echo"
)

// AddDevice adds a device to the database
func AddDevice(context echo.Context) error {
	log.L.Debugf("%s Starting AddDevice...", helpers.DevicesTag)

	// get information from the context
	deviceID := context.Param("device")
	username := getUsernameString(context)

	var device structs.Device
	err := context.Bind(&device)
	if err != nil {
		msg := fmt.Sprintf("failed to bind request body for %s : %s", deviceID, err.Error())
		log.L.Errorf("%s %s", helpers.DevicesTag, msg)
		return context.JSON(http.StatusBadRequest, err)
	}

	// call helper function
	result, ne := helpers.AddDevice(deviceID, device)
	if ne != nil {
		log.L.Errorf("%s %s", helpers.DevicesTag, ne.Error())
		return context.JSON(http.StatusInternalServerError, result)
	}

	helpers.CreateAndAddDeviceChange(device, helpers.AddAction, username)

	log.L.Debugf("%s The device %s was successfully created!", helpers.DevicesTag, deviceID)
	return context.JSON(http.StatusOK, result)
}

// AddMultipleDevices adds a set of devices to the database
func AddMultipleDevices(context echo.Context) error {
	log.L.Debugf("%s Starting AddMultipleDevices...", helpers.DevicesTag)

	// get information from the context
	username := getUsernameString(context)

	var devices []structs.Device

	err := context.Bind(&devices)
	if err != nil {
		msg := fmt.Sprintf("failed to bind request body for multiple devices : %s", err.Error())
		log.L.Errorf("%s %s", helpers.DevicesTag, msg)
		return context.JSON(http.StatusBadRequest, err)
	}

	responses := helpers.AddBulkDevices(devices)

	results := helpers.RecordBulkDeviceChanges(responses, username)

	log.L.Debugf("%s Finished attempting to add multiple devices", helpers.DevicesTag)
	return context.JSON(http.StatusOK, results)
}

// GetDevice gets a device from the database based on the given ID
func GetDevice(context echo.Context) error {
	log.L.Debugf("%s Starting GetDevice...")

	// get information from the context
	deviceID := context.Param("device")

	device, err := helpers.GetDevice(deviceID)
	if err != nil {
		msg := fmt.Sprintf("failed to get the device %s : %s", deviceID, err.Error())
		log.L.Errorf("%s %s", helpers.DevicesTag, msg)
		return context.JSON(http.StatusInternalServerError, err)
	}

	log.L.Debugf("%s Successfully found the device %s!", helpers.DevicesTag, deviceID)
	return context.JSON(http.StatusOK, device)
}

// GetAllDevices gets all devices from the database
func GetAllDevices(context echo.Context) error {
	log.L.Debugf("%s Starting GetAllDevices...", helpers.DevicesTag)

	devices, err := helpers.GetAllDevices()
	if err != nil {
		msg := fmt.Sprintf("failed to get all devices : %s", err.Error())
		log.L.Errorf("%s %s", helpers.DevicesTag, msg)
		return context.JSON(http.StatusBadRequest, err)
	}

	log.L.Debugf("%s Successfully got all devices!", helpers.DevicesTag)
	return context.JSON(http.StatusOK, devices)
}

// GetDevicesByRoom gets all devices in a room based on the given room ID
func GetDevicesByRoom(context echo.Context) error {
	log.L.Debugf("%s Starting GetDevicesByRoom...", helpers.DevicesTag)

	// get information from the context
	roomID := context.Param("room")

	devices, err := helpers.GetDevicesByRoom(roomID)
	if err != nil {
		msg := fmt.Sprintf("failed to get all devices in the room %s : %s", roomID, err.Error())
		log.L.Errorf("%s %s", helpers.DevicesTag, msg)
		return context.JSON(http.StatusBadRequest, err)
	}

	log.L.Debugf("%s Successfully got all the devices in the room %s!", helpers.DevicesTag, roomID)
	return context.JSON(http.StatusOK, devices)
}

// GetDevicesByRoomAndRole gets all devices in a room based on the given room ID and role ID
func GetDevicesByRoomAndRole(context echo.Context) error {
	log.L.Debugf("%s Starting GetDevicesByRoomAndRole...", helpers.DevicesTag)

	// get information from the context
	roomID := context.Param("room")
	roleID := context.Param("role")

	devices, err := helpers.GetDevicesByRoomAndRole(roomID, roleID)
	if err != nil {
		msg := fmt.Sprintf("failed to get all devices in the room %s with the role %s : %s", roomID, roleID, err.Error())
		log.L.Errorf("%s %s", helpers.DevicesTag, msg)
		return context.JSON(http.StatusBadRequest, err)
	}

	log.L.Debugf("%s Successfully got all the devices in the room %s with the role %s!", helpers.DevicesTag, roomID, roleID)
	return context.JSON(http.StatusOK, devices)
}

// GetDevicesByTypeAndRole gets all devices of a given type that also have the given role
func GetDevicesByTypeAndRole(context echo.Context) error {
	log.L.Debugf("%s Starting GetDevicesByTypeAndRole...", helpers.DevicesTag)

	// get information from the context
	typeID := context.Param("type")
	roleID := context.Param("role")

	devices, err := helpers.GetDevicesByTypeAndRole(typeID, roleID)
	if err != nil {
		msg := fmt.Sprintf("failed to get all devices with the role %s of the type %s : %s", roleID, typeID, err.Error())
		log.L.Errorf("%s %s", helpers.DevicesTag, msg)
		return context.JSON(http.StatusBadRequest, err)
	}

	log.L.Debugf("%s Successfully got all devices with the role %s of the type %s!", helpers.DevicesTag, roleID, typeID)
	return context.JSON(http.StatusOK, devices)
}

// UpdateDevice updates a device in the database
func UpdateDevice(context echo.Context) error {
	log.L.Debugf("%s Starting UpdateDevice...")

	// get information from the context
	deviceID := context.Param("room")
	username := getUsernameString(context)

	var device structs.Device
	err := context.Bind(&device)
	if err != nil {
		msg := fmt.Sprintf("failed to bind request body for %s : %s", deviceID, err.Error())
		log.L.Errorf("%s %s", helpers.DevicesTag, msg)
		return context.JSON(http.StatusBadRequest, err)
	}

	// call the helper function
	result, ne := helpers.UpdateDevice(deviceID, device)
	if ne != nil {
		log.L.Errorf("%s %s", helpers.DevicesTag, ne.Error())
		return context.JSON(http.StatusInternalServerError, result)
	}

	helpers.CreateAndAddDeviceChange(device, helpers.UpdateAction, username)

	log.L.Debugf("%s The device %s was successfully updated!", helpers.DevicesTag, deviceID)
	return context.JSON(http.StatusOK, result)
}

// UpdateMultipleDevices updates a set of devices in the database
func UpdateMultipleDevices(context echo.Context) error {
	log.L.Debugf("%s Starting UpdateMultipleDevices...")

	// get information from the context
	username := getUsernameString(context)

	var devices map[string]structs.Device

	err := context.Bind(&devices)
	if err != nil {
		msg := fmt.Sprintf("failed to bind request body for multiple devices : %s", err.Error())
		log.L.Errorf("%s %s", helpers.DevicesTag, msg)
		return context.JSON(http.StatusBadRequest, err)
	}

	var results []helpers.DBResponse
	// call helper function as we iterate
	for id, device := range devices {
		res, ne := helpers.UpdateDevice(id, device)
		if ne != nil {
			log.L.Errorf("%s %s", helpers.DevicesTag, ne.Error())
		}

		helpers.CreateAndAddDeviceChange(device, helpers.UpdateAction, username)
		results = append(results, res)
	}

	log.L.Debugf("%s The devices were successfully updated!", helpers.DevicesTag)
	return context.JSON(http.StatusOK, results)
}

// DeleteDevice deletes a device from the database based on the given ID
func DeleteDevice(context echo.Context) error {
	log.L.Debugf("%s Starting DeleteDevice...")

	// get information from the context
	deviceID := context.Param("device")
	username := getUsernameString(context)

	device := structs.Device{ID: deviceID}

	// call helper function
	result, ne := helpers.DeleteDevice(deviceID)
	if ne != nil {
		log.L.Errorf("%s %s", helpers.DevicesTag, ne.Error())
		return context.JSON(http.StatusInternalServerError, result)
	}

	helpers.CreateAndAddDeviceChange(device, helpers.DeleteAction, username)

	log.L.Debugf("%s The device %s was successfully deleted!", helpers.DevicesTag, deviceID)
	return context.JSON(http.StatusOK, result)
}

// GetDeviceTypes gets a list of possible device types
func GetDeviceTypes(context echo.Context) error {
	log.L.Debugf("%s Starting GetDeviceTypes...", helpers.DevicesTag)

	types, err := helpers.GetDeviceTypes()
	if err != nil {
		msg := fmt.Sprintf("failed to get all device types : %s", err.Error())
		log.L.Errorf("%s %s", helpers.DevicesTag, msg)
		return context.JSON(http.StatusInternalServerError, err)
	}

	log.L.Debugf("%s Successfully got all device types!", helpers.DevicesTag)
	return context.JSON(http.StatusOK, types)
}

// GetDeviceRoles gets a list of possible device roles
func GetDeviceRoles(context echo.Context) error {
	log.L.Debugf("%s Starting GetDeviceRoles...", helpers.DevicesTag)

	roles, err := helpers.GetDeviceRoles()
	if err != nil {
		msg := fmt.Sprintf("failed to get all device roles : %s", err.Error())
		log.L.Errorf("%s %s", helpers.DevicesTag, msg)
		return context.JSON(http.StatusInternalServerError, err)
	}

	log.L.Debugf("%s Successfully got all device roles!", helpers.DevicesTag)
	return context.JSON(http.StatusOK, roles)
}

// GetDeviceRawIPAddress takes a device's hostname address and returns the IP address associated with it, if it exists
func GetDeviceRawIPAddress(context echo.Context) error {
	log.L.Debugf("%s Starting GetDeviceRawIPAddress...", helpers.DevicesTag)

	hostname := context.Param("hostname")

	addrs, err := net.LookupHost(hostname)
	if err != nil {
		msg := fmt.Sprintf("failed to resolve hostname address %s : %s", hostname, err.Error())
		log.L.Errorf("%s %s", helpers.DevicesTag, msg)
		return context.JSON(http.StatusInternalServerError, err)
	}

	address := ""

	if len(addrs) >= 1 {
		address = addrs[0]
	}

	log.L.Debugf("%s Successfully got the IP address for %s!", helpers.DevicesTag, hostname)
	return context.JSON(http.StatusOK, address)
}
