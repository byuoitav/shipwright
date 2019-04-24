import { Component, OnInit, Input } from "@angular/core";
import { StringsService } from "src/app/services/strings.service";
import { DataService } from "src/app/services/data.service";
import { ActivatedRoute } from "@angular/router";
import { Device } from "src/app/objects/database";

@Component({
  selector: "device-list",
  templateUrl: "./devicelist.component.html",
  styleUrls: ["./devicelist.component.scss"]
})
export class DeviceListComponent implements OnInit {
  roomID: string;
  @Input() deviceList: Device[] = [];

  constructor(public text: StringsService, private route: ActivatedRoute, public data: DataService) {
    this.route.params.subscribe(params => {
      this.roomID = params["roomID"];
      this.deviceList = this.data.roomToDevicesMap.get(this.roomID);
    });
   }

  ngOnInit() {
  }

  GoBack() {
    window.history.back();
  }

  IsAControlProcessor(device: Device): boolean {
    return (device.type.id === "Pi3");
  }

  IsADisplay(device: Device): boolean {
    return this.data.deviceTypeMap.get(device.type.id).tags.includes("display");
  }

  IsAnInput(device: Device): boolean {
    return this.data.deviceTypeMap.get(device.type.id).input;
  }

  IsASwitcher(device: Device): boolean {
    return this.data.deviceTypeMap.get(device.type.id).tags.includes("video-switcher");
  }

  IsAnAudioDevice(device: Device): boolean {
    return this.data.deviceTypeMap.get(device.type.id).tags.includes("audio");
  }
}
