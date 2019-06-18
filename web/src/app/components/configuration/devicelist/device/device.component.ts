import { Component, OnInit, Input, OnChanges } from "@angular/core";
import { StringsService } from "src/app/services/strings.service";
import { ModalService } from "src/app/services/modal.service";
import { Device } from "src/app/objects/database";
import { DataService } from "src/app/services/data.service";
import { APIService } from "src/app/services/api.service";

@Component({
  selector: "device",
  templateUrl: "./device.component.html",
  styleUrls: ["./device.component.scss"]
})
export class DeviceComponent implements OnInit, OnChanges {
  @Input() device: Device;
  rawIP = "";
  @Input() devicesInRoom: Device[] = [];

  constructor(public text: StringsService, public modal: ModalService, public data: DataService, public api: APIService) {
    if (this.data.finished) {
      this.doSetup();
    } else {
      this.data.loaded.subscribe(() => {
        this.doSetup();
      });
    }
  }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.data.finished) {
      this.doSetup();
    } else {
      this.data.loaded.subscribe(() => {
        this.doSetup();
      });
    }
  }

  doSetup() {
    if (this.device != null) {
      this.GetRawIP();
      if (this.devicesInRoom != null && this.devicesInRoom.length > 0) {
        return;
      } else {
        const roomID = this.device.id.substr(0, this.device.id.lastIndexOf("-"));
        this.devicesInRoom = this.data.roomToDevicesMap.get(roomID);
      }
    }
  }

  GetDeviceIcon() {
    return this.text.DefaultIcons[this.device.type.id];
  }

  GetRawIP() {
    if (this.device != null) {
      if (this.device.address !== "0.0.0.0") {
        this.api.GetDeviceRawIPAddress(this.device.address).then(addr => {
          this.rawIP = addr as string;
        });
      } else {
        this.rawIP = this.device.address;
      }
    }
  }
}
