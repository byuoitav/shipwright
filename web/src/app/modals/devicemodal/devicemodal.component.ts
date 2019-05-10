import { Component, OnInit, Inject, Input } from "@angular/core";
import { StringsService } from "src/app/services/strings.service";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { DataService } from "src/app/services/data.service";
import { Device, DeviceType, Port, DBResponse } from "src/app/objects/database";
import { APIService } from "src/app/services/api.service";

export class DeviceModalData {
  device: Device;
  devicesInRoom: Device[];
}

@Component({
  selector: "device-modal",
  templateUrl: "./devicemodal.component.html",
  styleUrls: ["./devicemodal.component.scss"]
})
export class DeviceModalComponent implements OnInit {
  RoleList = [];
  UnappliedRoles = [];
  CurrentType: DeviceType = new DeviceType();
  rawIP = "Not set in QIP";
  tabIndex = 0;

  @Input() devicesInRoom: Device[] = [];
  sourceDevices: string[] = [];
  @Input() device: Device;
  @Input() readOnly: boolean;
  destinationDevices: string[] = [];

  newAttrKey: string;
  newAttrVal: string;

  constructor(
    public text: StringsService,
    public dialogRef: MatDialogRef<DeviceModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeviceModalData,
    public dataService: DataService,
    private api: APIService
  ) {
    console.log(this.data);
    this.device = this.data.device;
    this.RoleList = this.device.roles;
    this.UpdateRoleLists();
    this.CurrentType = this.dataService.deviceTypeMap.get(
      this.device.type.id
    );
    this.FixMe();
    this.api.GetDeviceRawIPAddress(this.device.address).then(addr => {
      if (addr != null) {
        this.rawIP = addr as string;
      }
    });
    if (this.devicesInRoom.length === 0) {
      if (this.data != null && this.data.devicesInRoom != null) {
        this.devicesInRoom = this.data.devicesInRoom;
      } else {
        this.devicesInRoom = this.dataService.roomToDevicesMap.get(
          this.device.id.substr(0, this.device.id.lastIndexOf("-"))
        );
      }
    }

    this.SetSourceAndDestinationDevices();
  }

  ngOnInit() {
    this.GetDeviceRoleList();
  }

  Close() {
    this.dialogRef.close();
  }

  FixMe() {
    this.AddMissingPorts(this.device);
    for (const port of this.device.ports) {
      if (port.tags == null || port.tags.length === 0) {
        for (const typePort of this.CurrentType.ports) {
          if (typePort.id === port.id) {
            for (const tag of typePort.tags) {
              port.tags.push(tag);
            }
          }
        }
      }
    }
  }

  UpdateRoleLists() {
    this.UnappliedRoles = [];
    for (const role of this.RoleList) {
      let PushToAddList = true;

      if (this.device.roles != null) {
        this.device.roles.forEach(dRole => {
          if (role.id === dRole.id) {
            PushToAddList = false;
          }
        });
      }

      if (PushToAddList) {
        this.UnappliedRoles.push(role);
      }
    }
  }

  GetDeviceRoleList() {
    this.RoleList = this.dataService.deviceRoles;
    this.UpdateRoleLists();
  }

  UpdateDeviceType() {
    if (this.data != null && this.device.type != null) {
      this.CurrentType = this.dataService.deviceTypeMap.get(
        this.device.type.id
      );

      if (this.CurrentType != null && this.CurrentType.roles != null) {
        this.device.roles = this.CurrentType.roles;
      }

      this.UpdateRoleLists();
    }
  }

  IsAnInPort(port: Port): boolean {
    return port.tags.includes("in");
  }

  SetSourceAndDestinationDevices() {
    for (const dev of this.devicesInRoom) {
      const type = this.dataService.deviceTypeMap.get(dev.type.id);
      if (type.source) {
        this.sourceDevices.push(dev.id);
      }
      if (type.destination) {
        this.destinationDevices.push(dev.id);
      }
    }
  }

  setTab(tab: number) {
    this.tabIndex = tab;
  }

  saveDevice = async (): Promise<boolean> => {
    this.RemoveExcessPorts(this.device);
    console.log("saving device", this.data);
    try {
      let resp: DBResponse;
      if (!this.device.isNew) {
        resp = await this.api.UpdateDevice(
          this.device.id,
          this.device
        );
        if (resp.success) {
          console.log("successfully updated device", resp);
        } else {
          console.error("failed to update device", resp);
        }
      } else {
        resp = await this.api.AddDevice(this.device);

        if (resp.success) {
          console.log("successfully added device", resp);
          this.device.isNew = false;
        } else {
          console.error("failed to add device", resp);
        }
      }

      return resp.success;
    } catch (e) {
      console.error("failed to update device:", e);
      return false;
    }
  };

  close(result: any) {
    this.dialogRef.close(result);
  }

  AddMissingPorts(device: Device) {
    const type = this.dataService.deviceTypeMap.get(device.type.id);

    if (type.ports != null && type.ports.length > 0) {
      for (const typePort of type.ports) {
        if (device.ports == null) {
          device.ports = [];
        }

        let found = false;

        for (const devPort of device.ports) {
          if (devPort.id === typePort.id) {
            found = true;
          }
        }

        if (!found) {
          device.ports.push(typePort);
          device.ports.sort(this.text.SortAlphaNumByID);
        }
      }
    }
  }

  RemoveExcessPorts(device: Device) {
    if (device.ports !== null && device.ports.length > 0) {
      const portsToKeep: Port[] = [];

      for (const port of device.ports) {
        if (port.sourceDevice !== null && port.sourceDevice !== undefined
          && port.destinationDevice !== null && port.destinationDevice !== undefined) {
          portsToKeep.push(port);
        }
      }

      console.log(portsToKeep);

      device.ports = portsToKeep;
    }
  }

  PortsAreFine(): boolean {
    if (this.device.ports == null || this.device.ports.length === 0) {
      return true;
    } else {
      for (const p of this.device.ports) {
        if (
          p.sourceDevice != null &&
          p.sourceDevice.length > 0 &&
          p.destinationDevice != null &&
          p.destinationDevice.length > 0
        ) {
          return true;
        }
      }
      // no ports are set
      return false;
    }
  }

  AddAttribute() {
    if (this.device.attributes == null) {
      this.device.attributes = new Map<string, any>();
    }

    if (this.newAttrKey != null && this.newAttrVal != null) {
      if (this.newAttrKey.length > 0 && this.newAttrVal.length > 0) {
        this.device.attributes.set(this.newAttrKey, this.newAttrVal);
        this.newAttrKey = "";
        this.newAttrVal = "";
      }
    }
  }

  RemoveAttribute(key: string) {
    if (this.device.attributes != null) {
      if (this.device.attributes.has(key)) {
        this.device.attributes.delete(key);
      }
    }
  }
}
