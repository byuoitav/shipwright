import { Component, OnInit, Inject } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DataService} from 'src/app/services/data.service';
import { Device, DeviceType, Port } from 'src/app/objects/database';

@Component({
  selector: 'device-modal',
  templateUrl: './devicemodal.component.html',
  styleUrls: ['./devicemodal.component.scss']
})
export class DeviceModalComponent implements OnInit {
  RoleList = [];
  UnappliedRoles = [];
  CurrentType : DeviceType = new DeviceType();

  constructor(public text: StringsService, public dialogRef: MatDialogRef<DeviceModalComponent>, @Inject(MAT_DIALOG_DATA) public data: Device, public dataService: DataService) {
    this.RoleList = data.roles;
    this.UpdateRoleLists();
    this.CurrentType = this.dataService.deviceTypeMap.get(this.data.type.id);
    this.FixMe();
  }

  ngOnInit() {
    this.GetDeviceRoleList();
  }

  Close() {
    this.dialogRef.close();
  }

  FixMe() {
    for (let port of this.data.ports) {
      if (port.tags == null || port.tags.length === 0) {
        for (let typePort of this.CurrentType.ports) {
          if (typePort.id == port.id) {
            for (let tag of typePort.tags) {
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
      let PushToAddList : boolean = true;

      this.data.roles.forEach(dRole => {
        if (role.id === dRole.id){
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

  IsAnInPort(port : Port) : boolean {
    return port.tags.includes("port-in");
  }
}
