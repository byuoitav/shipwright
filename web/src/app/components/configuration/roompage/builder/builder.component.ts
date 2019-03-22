import { Component, OnInit } from "@angular/core";
import { StringsService } from "src/app/services/strings.service";
import { DataService } from "src/app/services/data.service";
import { ActivatedRoute } from "@angular/router";
import { ModalService } from "src/app/services/modal.service";
import {
  Room,
  Device,
  UIConfig,
  Preset,
  Panel,
  DeviceType
} from "src/app/objects/database";

@Component({
  selector: "builder",
  templateUrl: "./builder.component.html",
  styleUrls: ["./builder.component.scss"]
})
export class BuilderComponent implements OnInit {
  roomID: string;
  room: Room;
  devicesInRoom: Device[] = [];
  filteredDevices: Device[] = [];

  config: UIConfig;

  projectorTypes: DeviceType[] = [];
  inputTypes: DeviceType[] = [];

  constructor(
    public text: StringsService,
    public data: DataService,
    private route: ActivatedRoute,
    public modal: ModalService
  ) {
    this.route.params.subscribe(params => {
      this.roomID = params["roomID"];

      if (this.data.finished) {
        this.GetRoomInfo();
      } else {
        this.data.loaded.subscribe(() => {
          this.GetRoomInfo();
        });
      }
    });
  }

  ngOnInit() {}

  private GetRoomInfo() {
    this.room = this.data.GetRoom(this.roomID);

    this.devicesInRoom = this.data.roomToDevicesMap.get(this.roomID);

    this.filteredDevices = this.devicesInRoom;

    this.config = this.data.roomToUIConfigMap.get(this.roomID);

    this.SetDeviceTypeLists();
  }

  GetPresetUIPath(presetName: string) {
    for (let i = 0; i < this.config.panels.length; i++) {
      if (this.config.panels[i].preset === presetName) {
        return this.config.panels[i].uiPath;
      }
    }
  }

  ChangeIcon(thing: any) {}

  GetDeviceByName(name: string): Device {
    for (let i = 0; i < this.devicesInRoom.length; i++) {
      if (this.devicesInRoom[i].name === name) {
        return this.devicesInRoom[i];
      }
    }
  }

  PrepPresetModal(preset: Preset) {
    const currentPanels: Panel[] = [];

    for (const panel of this.config.panels) {
      if (panel.preset === preset.name) {
        currentPanels.push(panel);
      }
    }

    this.modal.OpenPresetModal(preset, currentPanels, this.config);
  }

  SetDeviceTypeLists() {
    this.projectorTypes = [];
    this.inputTypes = [];

    for (const type of this.data.deviceTypeList) {
      if (type.tags.includes("projector")) {
        this.projectorTypes.push(type);
      }
      if (type.input) {
        this.inputTypes.push(type);
      }
    }
  }
}
