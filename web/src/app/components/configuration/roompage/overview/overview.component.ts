import { Component, OnInit, Input } from "@angular/core";
import { Device, Room, AttributeSet, DBResponse } from "src/app/objects/database";
import { DataService } from "src/app/services/data.service";
import { StringsService } from "src/app/services/strings.service";
import { ModalService } from "src/app/services/modal.service";
import { APIService } from "src/app/services/api.service";

@Component({
  selector: "room-overview",
  templateUrl: "./overview.component.html",
  styleUrls: ["./overview.component.scss"]
})
export class OverviewComponent implements OnInit {
  @Input() deviceList: Device[] = [];
  @Input() room: Room;

  roomOptions = ["Podium", "MMC", "Ceiling Box", "Cabinet Rack", "Closet Rack"];

  callbackFunc = (preset: AttributeSet) => {
    // console.log(preset);
    // const dev = new Device(this.data.deviceTypeMap.get(preset.deviceType), preset);
    // console.log(dev);

    const type = this.data.deviceTypeMap.get(preset.deviceType);
    const device = new Device(type, preset);

    device.name = this.text.DefaultDeviceNames[preset.deviceType];

    const numRegex = /[0-9]/;
    let num = 1;

    if (this.deviceList != null && this.deviceList.length > 0) {
      for (const dev of this.deviceList) {
        const index = dev.name.search(numRegex);
        const prefix = dev.name.substring(0, index);
        if (prefix === device.name) {
          num++;
        }
      }
    } else {
      this.deviceList = [];
    }

    device.name = device.name + num;

    device.id = this.room.id + "-" + device.name;
    device.address = device.id + ".byu.edu";
    device.displayName = this.text.DefaultDisplayNames[device.type.id];

    if (device.ports != null && device.ports.length > 0) {
      for (const port of device.ports) {
        if (port.tags.includes("in")) {
          port.destinationDevice = device.id;
        }
        if (port.tags.includes("out")) {
          port.sourceDevice = device.id;
        }
      }
    }

    device.isNew = true;
    this.deviceList.push(device);
    this.deviceList.sort(this.text.SortDevicesAlphaNum);

    console.log("Device: ", device);
    console.log("List: ", this.deviceList);

    this.modal.OpenDeviceModal(device, this.deviceList);
  };

  constructor(public data: DataService, public text: StringsService, public modal: ModalService, public api: APIService) { }

  ngOnInit() {
  }

  GoBack() {
    window.history.back();
  }

  ModifyRoomAttributes(attribute: string, checked: boolean) {
    if (this.room.attributes == null) {
      this.room.attributes = new Map<string, any>();
    }
    if (this.room.attributes.has(attribute) && !checked) {
      this.room.attributes.delete(attribute);
    } else if (!this.room.attributes.has(attribute) && checked) {
      this.room.attributes.set(attribute, checked);
    }
  }

  async saveRoom(): Promise<boolean> {
    if (this.room.name == null || this.room.name.length === 0) {
      this.room.name = this.room.id;
    }
    console.log("saving room", this.room);
    try {
      let resp: DBResponse;
      if (!this.room.isNew) {
        resp = await this.api.UpdateRoom(
          this.room.id,
          this.room
        );
        if (resp.success) {
          console.log("successfully updated room", resp);
        } else {
          console.error("failed to update room", resp);
        }
      } else {
        resp = await this.api.AddRoom(this.room);

        if (resp.success) {
          console.log("successfully added room", resp);
          this.room.isNew = false;
        } else {
          console.error("failed to add room", resp);
        }
      }

      return resp.success;
    } catch (e) {
      console.error("failed to update room:", e);
      return false;
    }
  }
}
