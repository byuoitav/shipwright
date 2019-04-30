import { Component, OnInit, Input } from "@angular/core";
import { StringsService } from "src/app/services/strings.service";
import { ModalService } from "src/app/services/modal.service";
import { DataService } from "src/app/services/data.service";
import { Building } from "src/app/objects/database";
import { BuildingStatus } from "src/app/objects/static";

@Component({
  selector: "building",
  templateUrl: "./building.component.html",
  styleUrls: ["./building.component.scss"]
})
export class BuildingComponent implements OnInit {
  @Input() building: Building = new Building();
  state: BuildingStatus;

  alertingRoomCount = 0;
  goodRoomCount = 0;

  constructor(public text: StringsService, public modal: ModalService, private data: DataService) {
  }

  ngOnInit() {
    if (this.data.finished) {
      this.GetBuildingState();
      this.UpdateCounts();
    } else {
      this.data.loaded.subscribe(() => {
        this.GetBuildingState();
        this.UpdateCounts();
      });
    }

    if (this.building.name == null || this.building.name.length === 0) {
      this.building.name = this.building.id;
    }
  }

  GetImage(): string {
    return "assets/images/" + this.building.id + ".jpg";
    // return "https://couchdb-dev.avs.byu.edu:5984/buildings/" + this.building.id + "/" + this.building.id + ".jpg";
  }

  GetBuildingState() {
    this.state = this.data.GetBuildingState(this.building.id);
  }

  UpdateCounts() {
    if (this.state != null && this.state.roomStates != null) {
      for (const rs of this.state.roomStates) {
        if (rs.roomIssue != null) {
          if (rs.roomIssue.length > 0) {
            this.alertingRoomCount++;
          } else {
            this.goodRoomCount++;
          }
        } else {
          this.goodRoomCount++;
        }
      }
    }
  }
}
