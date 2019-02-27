import { Component, OnInit, Input } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { ModalService } from 'src/app/services/modal.service';
import { DataService } from 'src/app/services/data.service';
import { Room, Device } from 'src/app/objects/database';
import { RoomStatus } from 'src/app/objects/static';

@Component({
  selector: 'room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {
  @Input() room: Room = new Room();
  deviceList: Device[] = [];
  state: RoomStatus = new RoomStatus();



  constructor(public text: StringsService, public modal: ModalService, public data: DataService) {}

  ngOnInit() {
    if(this.data.finished) {
      this.GetRoomState();
      this.state.UpdateAlerts();
      this.deviceList = this.data.roomToDevicesMap.get(this.room.id);
    } else {
      this.data.loaded.subscribe(() => {
        this.GetRoomState();
        this.state.UpdateAlerts();
        this.deviceList = this.data.roomToDevicesMap.get(this.room.id);
      })
    }

  }

  // ngOnChanges() {
  //   if(this.data.finished) {
  //     this.GetRoomState();
  //   } else {
  //     this.data.loaded.subscribe(() => {
  //       this.GetRoomState();
  //     })
  //   }
  // }

  GetRoomState() {
    this.state = this.data.GetRoomState(this.room.id);
  }

  IsADisplay(device: Device): boolean {
    if(device != null && device.type != null) {
      return this.data.DeviceHasRole(device, "VideoOut");
    }

    return false;
  }

  DisplayIsOn(device: Device): boolean {
    let record = this.data.GetStaticDevice(device.id)
  
    return record.power === "on"
  }
}
