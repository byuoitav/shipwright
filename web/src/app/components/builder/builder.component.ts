import { Component, OnInit } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { DataService } from 'src/app/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { Device, UIConfig, Room } from 'src/app/objects';

@Component({
  selector: 'builder',
  templateUrl: './builder.component.html',
  styleUrls: ['./builder.component.scss']
})
export class BuilderComponent implements OnInit {
  roomID: string
  room: Room;
  devicesInRoom: Device[] = [];
  filteredDevices: Device[] = [];

  config: UIConfig

  constructor(public text: StringsService, public data: DataService, private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.roomID = params["roomID"];

      if(this.data.finished) {
        this.GetRoomInfo()    
      } else {
        this.data.loaded.subscribe(() => {
          this.GetRoomInfo()
        })
      }
    })
  }

  ngOnInit() {
  }

  private GetRoomInfo() {
    this.room = this.data.GetRoom(this.roomID);

    this.devicesInRoom = this.data.roomToDevicesMap.get(this.roomID);

    this.filteredDevices = this.devicesInRoom;

    this.config = this.data.roomToUIConfigMap.get(this.roomID);
  }

  GetPresetUIPath(presetName: string) {
    
  }
}
