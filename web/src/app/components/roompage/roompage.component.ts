import { Component, OnInit } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { ActivatedRoute } from '@angular/router';
import { Room, Device } from 'src/app/objects';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'room-page',
  templateUrl: './roompage.component.html',
  styleUrls: ['./roompage.component.scss']
})
export class RoomPageComponent implements OnInit {
  roomID: string;
  room: Room;
  devices: Device[] = [];

  constructor(public text: StringsService, private route: ActivatedRoute, public data: DataService) {
    this.route.params.subscribe(params => {
      this.roomID = params["roomID"];
      
      if(this.data.finished) {
        this.room = this.data.getRoom(this.roomID);
        if(this.notADump()) {
          this.devices = this.data.roomToDevicesMap.get(this.roomID);
        }
      } else {
        this.data.loaded.subscribe(() => {
          this.room = this.data.getRoom(this.roomID);
          if(this.notADump()) {
            this.devices = this.data.roomToDevicesMap.get(this.roomID);
          }
        })
      }
      
    })
  }

  ngOnInit() {
  }

  notADump(): boolean {
    if(this.room == null) {
      return false
    }
    return this.room.configuration.id != "DMPS"
  }
}
