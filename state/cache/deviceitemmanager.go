package cache

import (
	"fmt"
	"strings"
	"time"

	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	sd "github.com/byuoitav/common/state/statedefinition"
	"github.com/byuoitav/common/v2/events"
)

/*
DeviceItemManager handles managing access to a single device in a cache. Changes to the device are submitted via the IncomingWriteChan and reads are submitted via the IncomingReadChan.
*/
type DeviceItemManager struct {
	WriteRequests chan DeviceTransactionRequest //channel to buffer changes to the device.
	ReadRequests  chan chan sd.StaticDevice
}

//DeviceTransactionRequest is submitted to read/write a the device being managed by this manager
//If both a MergeDevice and an Event are submitted teh MergeDevice will be processed first
type DeviceTransactionRequest struct {
	ResponseChan chan DeviceTransactionResponse

	// If you want to update the managed device with the values in this device. Note that the lastest edit timestamp field controls which fields will be kept in a merge.
	MergeDeviceEdit bool
	MergeDevice     sd.StaticDevice

	// If you want to store an event and return changes (if any)
	EventEdit bool
	Event     sd.State
}

//DeviceTransactionResponse .
type DeviceTransactionResponse struct {
	Changes   bool            //if the Transaction Request resulted in changes
	NewDevice sd.StaticDevice //the updated device with the changes included in the Transaction request included
	Error     *nerr.E         //if there were errors
}

//GetNewDeviceManager .
func GetNewDeviceManager(id string) (DeviceItemManager, *nerr.E) {
	a := DeviceItemManager{
		WriteRequests: make(chan DeviceTransactionRequest, 100),
		ReadRequests:  make(chan chan sd.StaticDevice, 100),
	}

	rm := strings.Split(id, "-")
	if len(rm) != 3 {
		log.L.Errorf("Invalid Device %v", id)
		return DeviceItemManager{}, nerr.Create(fmt.Sprintf("Can't build device manager: invalid ID %v", id), "invalid-id")
	}

	F := false //build a standard device
	device := sd.StaticDevice{
		DeviceID:              id,
		Room:                  rm[0] + "-" + rm[1],
		Building:              rm[0],
		UpdateTimes:           make(map[string]time.Time),
		Control:               id,
		EnableNotifications:   id,
		SuppressNotifications: id,
		ViewDashboard:         id,
		Alerting:              &F,
		DeviceType:            GetDeviceTypeByID(id),
	}

	go StartDeviceManager(a, device)
	return a, nil
}

//GetNewDeviceManagerWithDevice will assume overwriting of all the info, won't initialize to default values
func GetNewDeviceManagerWithDevice(dev sd.StaticDevice) (DeviceItemManager, *nerr.E) {
	a := DeviceItemManager{
		WriteRequests: make(chan DeviceTransactionRequest, 100),
		ReadRequests:  make(chan chan sd.StaticDevice, 100),
	}

	rm := strings.Split(dev.DeviceID, "-")
	if len(rm) != 3 {
		return DeviceItemManager{}, nerr.Create("Invalid device, must have deviceID", "invalid")
	}

	go StartDeviceManager(a, dev)
	return a, nil
}

//StartDeviceManager is a blocking call to start that device manager listening over the read and write channels.
func StartDeviceManager(m DeviceItemManager, device sd.StaticDevice) {

	var merged sd.StaticDevice
	var changes bool
	var err *nerr.E

	for {
		select {
		case write := <-m.WriteRequests:
			if write.ResponseChan == nil {
				continue
			}

			if write.MergeDeviceEdit {
				if write.MergeDevice.DeviceID != device.DeviceID {
					write.ResponseChan <- DeviceTransactionResponse{Error: nerr.Create("Can't change the ID of a device", "invalid-operation"), NewDevice: device, Changes: false}
					continue
				}
				_, merged, changes, err = sd.CompareDevices(device, write.MergeDevice)

				if err != nil {
					write.ResponseChan <- DeviceTransactionResponse{Error: err, Changes: false}
					continue
				}
			}

			if write.EventEdit {
				if HasTag(events.CoreState, write.Event.Tags) {
					if s, ok := write.Event.Value.(string); ok {
						if len(s) < 1 {
							//we don't do anything with this
							write.ResponseChan <- DeviceTransactionResponse{Error: nil, Changes: false}
							continue
						}
					}
				}

				if HasTag(events.Heartbeat, write.Event.Tags) {
					changes, merged, err = SetDeviceField(
						"last-heartbeat",
						write.Event.Time,
						write.Event.Time,
						device,
					)
				} else {
					changes, merged, err = SetDeviceField(
						write.Event.Key,
						write.Event.Value,
						write.Event.Time,
						device,
					)
				}
				if err != nil {
					write.ResponseChan <- DeviceTransactionResponse{Error: err, Changes: false}
					continue
				}

				// if it has a user-generated tag
				if HasTag(events.UserGenerated, write.Event.Tags) {
					merged.LastUserInput = write.Event.Time
					device = merged
				}

				// i'm just going to assume yeah, ask joe later
				if HasTag(events.CoreState, write.Event.Tags) || HasTag(events.DetailState, write.Event.Tags) {
					merged.LastStateReceived = write.Event.Time
					device = merged
				}
			}

			if changes {
				//only reassign if we have to
				device = merged
			}

			write.ResponseChan <- DeviceTransactionResponse{Error: err, NewDevice: device, Changes: changes}
		case read := <-m.ReadRequests:
			//just send it back
			if read != nil {
				//we need to
				newdev := device
				newdev.UpdateTimes = make(map[string]time.Time)
				for k, v := range device.UpdateTimes {
					newdev.UpdateTimes[k] = v
				}
				read <- newdev
			}
		}
	}
}
