import { Component, OnInit, Input } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { Room, Device } from 'src/app/objects';
import { ModalService } from 'src/app/services/modal.service';
import { DataService } from 'src/app/services/data.service';
import { StaticService } from 'src/app/services/static.service';

@Component({
  selector: 'room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {
  @Input() room: Room;
  deviceList: Device[] = [];

  constructor(public text: StringsService, public modal: ModalService, private data: DataService, private state: StaticService) {
    if(this.data.finished) {
      this.getDeviceList();
    } else {
      this.data.loaded.subscribe(() => {
        this.getDeviceList();
      })
    }
  }

  ngOnInit() {
  }

  ngOnChanges() {
    if(this.data.finished) {
      this.getDeviceList();
    } else {
      this.data.loaded.subscribe(() => {
        this.getDeviceList();
      })
    }
  }

  private getDeviceList() {
    if(this.room != null) {
      // console.log(this.data.roomToDevicesMap);
      this.deviceList = this.data.roomToDevicesMap.get(this.room.id);
      // console.log(this.deviceList);
    }
  }

  IsADisplay(device: Device): boolean {
    if(device != null && device.type != null) {
      return this.data.DeviceHasRole(device, "VideoOut");
    }

    return false;
  }

  DisplayIsOn(device: Device): boolean {
    // TODO make this return the power state of the display
    let deviceRecords = this.state.roomToDeviceRecords.get(this.room.id)

    if(deviceRecords == null || deviceRecords.length == 0) {
      return false
    }
    
    for(let record of deviceRecords) {
      if(record.deviceID === device.id) {
        if(record.power === "on") {
          return true
        } else {
          return false
        }
      }
    }
    
    return false
  }

  GetRoomIcon(): string {
    if(this.room.configuration.id == "DMPS") {
      return "accessible_forward"
    } else if(this.deviceList != null && this.deviceList.length == 1) {
      return "today"
    } else {
      return "video_label"
    }
  }

  IsPiSystem() {
    if(this.room.configuration.id == "DMPS") {
      return false
    } else if(this.deviceList != null && this.deviceList.length == 1) {
      return false
    } else {
      return true
    }
  }

  GetGoodDevicesCount(): number {
    //TODO return the actual number of good devices
    if(this.deviceList == null) {
      return 0;
    }

    return this.deviceList.length;
  }

  GetBadDevicesCount(): number {
    // TODO return the actual number of bad devices
    return 0;
  }

  NotADump() {
    return !(this.room.configuration.id == "DMPS")
  }
}
