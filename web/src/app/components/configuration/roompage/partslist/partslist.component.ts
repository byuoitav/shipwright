import { Component, OnInit, Input } from "@angular/core";
import { Device, Room } from "src/app/objects/database";
import { DataService } from "src/app/services/data.service";
import { StringsService } from "src/app/services/strings.service";
import { ModalService } from "src/app/services/modal.service";

@Component({
  selector: "partslist",
  templateUrl: "./partslist.component.html",
  styleUrls: ["./partslist.component.scss"]
})
export class PartsListComponent implements OnInit {
  @Input() deviceList: Device[] = [];
  @Input() devices: Device[] = [];
  @Input() room: Room;
  @Input() roomid: string;

  constructor(public data: DataService, public text: StringsService, public modal: ModalService) { 
    if (this.data.finished) {
      this.loadup();
    } else {
      this.data.loaded.subscribe(() => {
        this.loadup();
      });
    }
  }

  ngOnInit() {
  }

  loadup() {
    console.log(this.roomid);
    //console.log(this.data.roomToDevicesMap.get(this.room.id));
    // this.deviceList = this.data.roomToDevicesMap.get(this.room.id);
    // this.devices = this.data.roomToDevicesMap.get(this.room.id); 
    console.log("//////////////////////", this.deviceList);
    console.log("//////////////////////", this.devices);
  }

}
