import { Component, OnInit, Input } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { Room, Device } from 'src/app/objects';
import { ModalService } from 'src/app/services/modal.service';
import { DataService } from 'src/app/services/data.service';
import { StaticService } from 'src/app/services/static.service';
import { MonitoringService } from 'src/app/services/monitoring.service';

@Component({
  selector: 'room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {
  @Input() room: Room;
  deviceList: Device[] = [];

  goodDeviceCount: number
  badDeviceCount: number

  constructor(public text: StringsService, public modal: ModalService, private data: DataService, private state: StaticService, private monitor: MonitoringService) {
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
      this.GetDeviceCounts()
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

  GetDeviceCounts() {
    this.goodDeviceCount = 0;
    this.badDeviceCount = 0;

    if(this.deviceList == null) {
      return
    }
    
    this.goodDeviceCount = this.deviceList.length
    let ra = this.monitor.roomAlertsMap.get(this.room.id)

    let alerts
    if(ra != null) {
      alerts = ra.alerts
    }
    
    if(alerts != null && alerts.length > 0) {
      for(let device of this.deviceList) {
        for(let alert of alerts) {
          if(alert.deviceID == device.id) {
            this.goodDeviceCount--;
            this.badDeviceCount++;
            break
          }
        } 
      }
    }
  }

  NotADump() {
    return !(this.room.configuration.id == "DMPS")
  }
}
