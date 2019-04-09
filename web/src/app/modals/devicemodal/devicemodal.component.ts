import { Component, OnInit, Inject } from "@angular/core";
import { StringsService } from "src/app/services/strings.service";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { DataService } from "src/app/services/data.service";
import { Device, DeviceType, Port } from "src/app/objects/database";
import { APIService } from "src/app/services/api.service";

@Component({
  selector: "device-modal",
  templateUrl: "./devicemodal.component.html",
  styleUrls: ["./devicemodal.component.scss"]
})
export class DeviceModalComponent implements OnInit {
  RoleList = [];
  UnappliedRoles = [];
  CurrentType: DeviceType = new DeviceType();
  rawIP = "";
  tabIndex = 0;

  devicesInRoom: Device[] = [];
  sourceDevices: string[] = [];
  destinationDevices: string[] = [];

  constructor(
    public text: StringsService,
    public dialogRef: MatDialogRef<DeviceModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Device,
    public dataService: DataService,
    private api: APIService
  ) {
    this.RoleList = data.roles;
    this.UpdateRoleLists();
    this.CurrentType = this.dataService.deviceTypeMap.get(this.data.type.id);
    this.FixMe();
    this.api.GetDeviceRawIPAddress(this.data.address).then(addr => {
      this.rawIP = addr as string;
    });

    this.devicesInRoom = this.dataService.roomToDevicesMap.get(
      this.data.id.substr(0, this.data.id.lastIndexOf("-"))
    );
    this.SetSourceAndDestinationDevices();
  }

  ngOnInit() {
    this.GetDeviceRoleList();
  }

  Close() {
    this.dialogRef.close();
  }

  FixMe() {
    for (const port of this.data.ports) {
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
    this.RoleList.forEach(role => {
      let PushToAddList = true;

      this.data.roles.forEach(dRole => {
        if (role.id === dRole.id) {
          PushToAddList = false;
        }
      });

      if (PushToAddList) {
        this.UnappliedRoles.push(role);
      }
    });
  }

  GetDeviceRoleList() {
    this.RoleList = this.dataService.deviceRoles;
    this.UpdateRoleLists();
  }

  UpdateDeviceType() {
    if (this.data != null && this.data.type != null) {
      this.CurrentType = this.dataService.deviceTypeMap.get(this.data.type.id);

      if (this.CurrentType != null && this.CurrentType.roles != null) {
        this.data.roles = this.CurrentType.roles;
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
    console.log("saving device", this.data);
    try {
      const resp = await this.api.UpdateDevice(this.data.id, this.data);
      if (resp.success) {
        console.log("successfully updated device", resp);
      } else {
        console.error("failed to update device", resp);
      }

      return resp.success;
    } catch (e) {
      console.error("failed to update device:", e);
      return false;
    }
  };
}
