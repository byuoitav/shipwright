import { Component, OnInit } from "@angular/core";
import { StringsService } from "src/app/services/strings.service";
import { ActivatedRoute } from "@angular/router";
import { DataService } from "src/app/services/data.service";
import { Room } from "src/app/objects/database";
import { ModalService } from "src/app/services/modal.service";

@Component({
  selector: "room-list",
  templateUrl: "./roomlist.component.html",
  styleUrls: ["./roomlist.component.scss"]
})
export class RoomListComponent implements OnInit {
  buildingID: string;
  roomList: Room[] = [];
  roomSearch: string;
  filteredRooms: Room[] = [];
  selectedDesignation = "";
  filterQueries: string[] = [];

  constructor(
    public text: StringsService,
    private route: ActivatedRoute,
    public data: DataService,
    public modal: ModalService
  ) {
    this.route.params.subscribe(params => {
      this.buildingID = params["buildingID"];
    });

    if (this.data.finished) {
      this.GetRooms();
    } else {
      this.data.loaded.subscribe(() => {
        this.GetRooms();
      });
    }
  }

  ngOnInit() {}

  private GetRooms() {
    this.roomList = this.data.buildingToRoomsMap.get(this.buildingID);
    this.filteredRooms = this.roomList;

    console.log(this.roomList);
    console.log(this.filteredRooms);
  }

  GoBack() {
    window.history.back();
  }

  FilterRooms() {
    this.filteredRooms = [];

    if (this.filterQueries.length === 0) {
      this.filteredRooms = this.roomList;
      return;
    }

    for (const room of this.roomList) {
      for (const query of this.filterQueries) {
        if (
          room.id.toLowerCase().includes(query.toLowerCase()) &&
          !this.filteredRooms.includes(room)
        ) {
          this.filteredRooms.push(room);
        }
        if (
          room.designation.toLowerCase().includes(query.toLowerCase()) &&
          !this.filteredRooms.includes(room)
        ) {
          this.filteredRooms.push(room);
        }
        for (const tag of room.tags) {
          if (
            tag.toLowerCase().includes(query.toLowerCase()) &&
            !this.filteredRooms.includes(room)
          ) {
            this.filteredRooms.push(room);
          }
        }
      }
    }
  }

  GetBuildingDesignations() {
    const designations: string[] = [];

    if (this.filteredRooms != null) {
      for (const room of this.filteredRooms) {
        if (!designations.includes(room.designation)) {
          designations.push(room.designation);
        }
      }
    }

    return designations;
  }

  CreateNewRoom() {
    const newRoom = new Room();
    newRoom.isNew = true;
    newRoom.id = this.buildingID + "-";

    this.modal.OpenRoomModal(newRoom);
    this.modal.roomDone.subscribe(r => {
      this.roomList.push(r);
    });
  }
}
