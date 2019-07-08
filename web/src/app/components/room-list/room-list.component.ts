import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { APIService } from "../../services/api.service";
import { TextService } from "../../services/text.service";
import { Room } from "../../objects/database";
import { MatDialog } from "@angular/material";
import { RoomModalComponent } from "../../modals/roommodal/roommodal.component";

@Component({
  selector: "room-list",
  templateUrl: "./room-list.component.html",
  styleUrls: ["./room-list.component.scss"]
})
export class RoomListComponent implements OnInit {
  buildingID: string;
  roomList: Room[] = [];
  filteredRooms: Room[] = [];
  filterQueries: string[] = [];

  constructor(
    public api: APIService,
    public text: TextService,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {
    this.route.params.subscribe(params => {
      this.buildingID = params["buildingID"];

      this.api.GetRoomsByBuilding(this.buildingID).then((answer) => {
        this.roomList = answer as Room[];
        this.filteredRooms = this.roomList;
      });
    });
  }

  ngOnInit() {
  }

  createRoom() {
    const newRoom = new Room();
    newRoom.id = this.buildingID + "-";
    newRoom.isNew = true;

    this.dialog.open(RoomModalComponent, { data: newRoom })
    .afterClosed()
    .subscribe((result) => {
      if (result !== null && result === true) {
        this.roomList.push(newRoom);
        this.roomList.sort(this.text.sortAlphaNumByID);
        this.filter();
      }
    });
  }

  editRoom(room: Room) {
    this.dialog.open(RoomModalComponent, { data: room })
    .afterClosed()
    .subscribe((result) => {
      if (result !== null && result === "deleted") {
        this.roomList.splice(
          this.roomList.indexOf(room),
          1
        );
        this.filter();
      }
    });
  }

  filter() {
    this.filteredRooms = [];

    if (this.filterQueries.length === 0) {
      this.filteredRooms = this.roomList;
      return;
    }

    for (const r of this.roomList) {
      for (const q of this.filterQueries) {
        if (r.id.toLowerCase().includes(q.toLowerCase()) && !this.filteredRooms.includes(r)) {
          this.filteredRooms.push(r);
        }
        if (r.name.toLowerCase().includes(q.toLowerCase()) && !this.filteredRooms.includes(r)) {
          this.filteredRooms.push(r);
        }
        if (r.description.toLowerCase().includes(q.toLowerCase()) && !this.filteredRooms.includes(r)) {
          this.filteredRooms.push(r);
        }
        if (r.designation.toLowerCase().includes(q.toLowerCase()) && !this.filteredRooms.includes(r)) {
          this.filteredRooms.push(r);
        }
        if (r.configuration.id.toLowerCase().includes(q.toLowerCase()) && !this.filteredRooms.includes(r)) {
          this.filteredRooms.push(r);
        }
        if (r.tags !== null) {
          for (const tag of r.tags) {
            if (tag.toLowerCase().includes(q.toLowerCase()) && !this.filteredRooms.includes(r)) {
              this.filteredRooms.push(r);
            }
          }
        }
        if (r.attributes !== null) {
          for (const [k, v] of r.attributes) {
            if (k.toLowerCase().includes(q.toLowerCase()) && !this.filteredRooms.includes(r)) {
              this.filteredRooms.push(r);
            }
            if (typeof v === "string" || v instanceof String) {
              if (v.toLowerCase().includes(q.toLowerCase()) && !this.filteredRooms.includes(r)) {
                this.filteredRooms.push(r);
              }
            }
          }
        }
      }
    }
  }
}
