import { Component, OnInit, Input } from "@angular/core";
import { Device, Room } from "src/app/objects/database";
import { DataService } from "src/app/services/data.service";
import { StringsService } from "src/app/services/strings.service";
import { ModalService } from "src/app/services/modal.service";

@Component({
  selector: "room-overview",
  templateUrl: "./overview.component.html",
  styleUrls: ["./overview.component.scss"]
})
export class OverviewComponent implements OnInit {
  @Input() deviceList: Device[] = [];
  @Input() room: Room;

  constructor(public data: DataService, public text: StringsService, public modal: ModalService) { }

  ngOnInit() {
  }

}
