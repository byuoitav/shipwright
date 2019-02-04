import { Component, OnInit } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { Room } from 'src/app/objects';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'room-list',
  templateUrl: './roomlist.component.html',
  styleUrls: ['./roomlist.component.scss']
})
export class RoomListComponent implements OnInit {
  buildingID: string;
  roomList: Room[] = [];

  constructor(public text: StringsService, private route: ActivatedRoute, public data: DataService) {
    this.route.params.subscribe(params => {
      this.buildingID = params["buildingID"];
    });

    if(this.data.finished) {
      this.getRooms();
    } else {
      this.data.loaded.subscribe(() => {
        this.getRooms();
      })
    }
  }

  ngOnInit() {
  }

  private getRooms() {
    this.roomList = this.data.buildingToRoomsMap.get(this.buildingID);
  }
}
