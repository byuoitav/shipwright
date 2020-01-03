import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Room, Device, Port, MenuTree, AttributeSet, DeviceType } from 'src/app/objects/database';
import { MatTableDataSource } from '@angular/material';
import { APIService } from 'src/app/services/api.service';

@Component({
  selector: 'room-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.scss']
})
export class DevicesComponent implements OnInit, OnChanges {
  @Input() room: Room;

  menuTree: MenuTree;
  deviceTypes: Map<string, DeviceType>;

  deviceDataSource: MatTableDataSource<Device>;

  deviceColumns = ["warning", "name", "type", "address"];

  constructor(private api: APIService) {
    this.api.GetMenuTree().then((answer) => {
      this.menuTree = answer;
    });
    this.api.GetDeviceTypes().then((answer) => {
      const typeArray = answer as DeviceType[];
      this.deviceTypes = new Map();

      for (const t of typeArray) {
        this.deviceTypes.set(t.id, t);
      }
    });
  }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.room) {
      this.deviceDataSource = new MatTableDataSource(this.room.devices);
    }
  }

  missingPorts(d: Device): boolean {
    if (d.ports === undefined || d.ports.length === 0) {
      return false;
    }

    for (const p of d.ports) {
      if (p.sourceDevice === undefined || p.sourceDevice.length === 0) {
        return true;
      }
      if (p.destinationDevice === undefined || p.destinationDevice.length === 0) {
        return true;
      }
    }

    return false;
  }

  setPortConnection(port: Port, connectedID: string) {
    if (port.isAnInPort()) {
      port.sourceDevice = connectedID;
    }
    if (port.isAnOutPort()) {
      port.destinationDevice = connectedID;
    }
  }

  hasInPorts = (device: Device):boolean => {
    let foundInPorts = false;

    if (device.type.ports !== undefined) {
      for (const p of device.type.ports) {
        if (p.isAnInPort()) {
          foundInPorts = true;
        }
      }
    }
    
    return foundInPorts;
  }

  hasOutPorts = (device: Device):boolean => {
    let foundOutPorts = false;

    if (device.type.ports !== undefined) {
      for (const p of device.type.ports) {
        if (p.isAnOutPort()) {
          foundOutPorts = true;
        }
      }
    }

    return foundOutPorts;
  }

  checkTypePort(device: Device, port: Port, out: boolean) {
    let match = false;

    const p = device.type.ports.find((x) => {
      return x.id === port.id;
    });

    if (p) {
      if (!out) {
        match = p.isAnInPort();
      } else {
        match = p.isAnOutPort();
      }
    }

    return match;
  }

  addNewDevice = (attributes: AttributeSet) => {
    console.log("adding new device: ", attributes);

    const dType = this.deviceTypes.get(attributes.deviceType);

    // Make a new device based on the type
    const dev = new Device(dType, attributes);

    // Find out what the number index of the name will be
    let count = 1;
    const numRegex = /[0-9]/;
    for (const d of this.room.devices) {
      if (d.name.includes(dType.defaultName)) {
        const index = d.name.search(numRegex);
        const prefix = d.name.substring(0, index);
        if (prefix === dType.defaultName) {
          count++;
        }
      }
    }

    // Set the default name from the type with the number found, and set the ID of the device as well
    dev.name = dType.defaultName + count;
    dev.id = this.room.id + "-" + dev.name;
    dev.displayName = dType.defaultUIName;

    // Set the device address to be the type's default, then replace any parameter fields
    
    dev.address = dType.defaultAddress;

    ////////// UNCOMMENT WHEN THE DEVICE TYPE DEFAULT ADDRESS THING GETS PUSHED UP AND REBUILT //////////
    // const b = this.room.id.split("-")[0]
    // const r = this.room.id.split("-")[1]
    // const bldgParam = "[BLDG]";
    // const roomParam = "[ROOM]";
    // const nameParam = "[NAME]";

    // if (dev.address.includes(bldgParam)) {
    //   dev.address.replace(bldgParam, b);
    // }
    // if (dev.address.includes(roomParam)) {
    //   dev.address.replace(roomParam, r);
    // }
    // if (dev.address.includes(nameParam)) {
    //   dev.address.replace(nameParam, dev.name);
    // }
    console.log(dev);
  }
}
