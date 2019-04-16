import { Component, OnInit, Input } from "@angular/core";
import { StringsService } from "src/app/services/strings.service";
import { ModalService } from "src/app/services/modal.service";
import { DataService } from "src/app/services/data.service";
import { Room } from "src/app/objects/database";
import { CombinedRoomState, StaticDevice } from "src/app/objects/static";

@Component({
  selector: "room",
  templateUrl: "./room.component.html",
  styleUrls: ["./room.component.scss"]
})
export class RoomComponent implements OnInit {
  @Input() room: Room = new Room();
  state: CombinedRoomState;

  alertingDeviceCount = 0;
  goodDeviceCount = 0;

  constructor(public text: StringsService, public modal: ModalService, public data: DataService) {}

  ngOnInit() {
    if (this.data.finished) {
      this.GetRoomState();
      this.UpdateCounts();
    } else {
      this.data.loaded.subscribe(() => {
        this.GetRoomState();
        this.UpdateCounts();
      });
    }

    if (this.room.name == null || this.room.name.length === 0) {
      this.room.name = this.room.id;
    }
  }

  GetRoomState() {
    this.state = this.data.GetRoomState(this.room.id);
  }

  IsADisplay(sd: StaticDevice): boolean {
    if (sd != null && sd.deviceType != null) {
      return sd.deviceType === "display";
    }

    return false;
  }

  DisplayIsOn(sd: StaticDevice): boolean {
    if (sd != null && sd.power != null) {
      return sd.power === "on";
    }

    return false;
  }

  GetDeviceName(deviceID: string): string {
    const IDParts = deviceID.split("-");
    if (IDParts.length === 3) {
      return IDParts[2];
    }
    return deviceID;
  }

  GetDisplayIcon(deviceID: string): string {
    const dev = this.data.GetDevice(deviceID);

    if (dev != null) {
      return this.text.DefaultIcons[dev.type.id];
    }

    return "videocam";
  }

  UpdateCounts() {
    if (this.state != null) {
      if (this.state.roomIssue != null && this.state.roomIssue.length > 0)  {
        this.alertingDeviceCount = this.state.roomIssue[0].alertDevices.length;
        this.goodDeviceCount = this.state.deviceStates.length - this.alertingDeviceCount;
      } else {
        this.alertingDeviceCount = 0;
        if (this.state.deviceStates != null) {
          this.goodDeviceCount = this.state.deviceStates.length;
        } else {
          this.goodDeviceCount = 0;
        }
      }
    }
  }
}
