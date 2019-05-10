import { Component, OnInit, Input } from "@angular/core";
import { StringsService } from "src/app/services/strings.service";
import { DataService } from "src/app/services/data.service";
import { ActivatedRoute } from "@angular/router";
import { Device } from "src/app/objects/database";

class DeviceCategory {
  title: string;
  tag: string;
}

@Component({
  selector: "device-list",
  templateUrl: "./devicelist.component.html",
  styleUrls: ["./devicelist.component.scss"]
})
export class DeviceListComponent implements OnInit {
  roomID: string;
  @Input() deviceList: Device[] = [];
  deviceCategories: DeviceCategory[] = [
    {
      title: "Control Processors",
      tag: "pi"
    },
    {
      title: "Displays",
      tag: "display"
    },
    {
      title: "Inputs",
      tag: "input"
    },
    {
      title: "Switchers",
      tag: "video-switcher"
    },
    {
      title: "Audio Devices",
      tag: "audio"
    }
  ];

  step = 0;

  constructor(public text: StringsService, private route: ActivatedRoute, public data: DataService) {
    this.route.params.subscribe(params => {
      this.roomID = params["roomID"];
      this.deviceList = this.data.roomToDevicesMap.get(this.roomID);
      this.deviceList.sort(this.text.SortDevicesAlphaNum);
    });
   }

  ngOnInit() {
  }

  GoBack() {
    window.history.back();
  }

  DeviceIsInCategory(device: Device, tag: string): boolean {
    return this.data.deviceTypeMap.get(device.type.id).tags.includes(tag);
  }

  GetCategoryCount(tag: string): number {
    let count = 0;
    if (this.deviceList != null && this.deviceList.length > 0) {
      for (const device of this.deviceList) {
        if (this.data.deviceTypeMap.get(device.type.id).tags.includes(tag)) {
          count++;
        }
      }
    }

    return count;
  }

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }
}
