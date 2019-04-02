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
  DeviceType,
  IOConfiguration
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
  deviceSearch: string;

  config: UIConfig = new UIConfig();

  projectorTypes: DeviceType[] = [];
  inputTypes: DeviceType[] = [];
  audioTypes: DeviceType[] = [];

  tvSizes: string[] = ["\"43", "\"55", "\"65", "\"75"];

  tempDevices: Device[] = [];

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

    window.onbeforeunload = function() {};
  }

  ngOnInit() {}

  private GetRoomInfo() {
    this.room = this.data.GetRoom(this.roomID);

    this.devicesInRoom = this.data.roomToDevicesMap.get(this.roomID);

    this.filteredDevices = this.devicesInRoom;

    this.config = this.data.roomToUIConfigMap.get(this.roomID);
    if (this.config == null) {
      this.config = new UIConfig();
    }

    this.FillMissingUIConfigInfo();

    this.SetDeviceTypeLists();
  }

  FillMissingUIConfigInfo() {
    // if missing output configuration
    if (this.config.outputConfiguration == null || this.config.outputConfiguration.length === 0) {
      this.config.outputConfiguration = [];
      for (const dev of this.devicesInRoom) {
        if (!this.config.outputConfiguration.some(io => io.name === dev.name)) {
          if (this.data.DeviceHasRole(dev, "VideoOut") || this.data.DeviceHasRole(dev, "Microphone")) {
            this.config.outputConfiguration.push(new IOConfiguration(dev.name, this.text.DefaultIcons[dev.type.id]));
          }
        }
      }
    }
    // if missing input configuration
    if (this.config.inputConfiguration == null || this.config.inputConfiguration.length === 0) {
      this.config.inputConfiguration = [];
      for (const dev of this.devicesInRoom) {
        if (!this.config.inputConfiguration.some(io => io.name === dev.name)) {
          if (this.data.deviceTypeMap.get(dev.type.id).input) {
            this.config.inputConfiguration.push(new IOConfiguration(dev.name, this.text.DefaultIcons[dev.type.id]));
          }
        }
      }
    }
  }

  GetPresetUIPath(presetName: string, trim: boolean) {
    for (let i = 0; i < this.config.panels.length; i++) {
      if (this.config.panels[i].preset === presetName) {
        if (!trim) {
          return this.config.panels[i].uiPath;
        } else {
          return this.config.panels[i].uiPath.substr(1);
        }
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
    this.audioTypes = [];

    for (const type of this.data.deviceTypeList) {
      if (type.tags.includes("projector")) {
        this.projectorTypes.push(type);
      }
      if (type.input) {
        this.inputTypes.push(type);
      }
      for (const role of type.roles) {
        if (role.id === "Microphone") {
          this.audioTypes.push(type);
        }
      }
    }
  }

  SearchDevices() {
    this.filteredDevices = [];

    const searchList: Device[] = this.devicesInRoom;
    searchList.sort(this.text.SortDevicesAlphaNum);

    if (this.deviceSearch == null || this.deviceSearch.length === 0) {
      this.filteredDevices = searchList;
      return;
    }

    searchList.forEach(device => {
      if (
        device.name.toLowerCase().includes(this.deviceSearch.toLowerCase()) &&
        !this.filteredDevices.includes(device)
      ) {
        this.filteredDevices.push(device);
      }

      if (
        device.displayName
          .toLowerCase()
          .includes(this.deviceSearch.toLowerCase()) &&
        !this.filteredDevices.includes(device)
      ) {
        this.filteredDevices.push(device);
      }

      if (
        device.type.id
          .toLowerCase()
          .includes(this.deviceSearch.toLowerCase()) &&
        !this.filteredDevices.includes(device)
      ) {
        this.filteredDevices.push(device);
      }

      device.roles.forEach(role => {
        if (
          role.id.toLowerCase().includes(this.deviceSearch.toLowerCase()) &&
          !this.filteredDevices.includes(device)
        ) {
          this.filteredDevices.push(device);
        }
      });

      if (device.tags != null) {
        device.tags.forEach(tag => {
          if (
            tag.toLowerCase().includes(this.deviceSearch.toLowerCase()) &&
            !this.filteredDevices.includes(device)
          ) {
            this.filteredDevices.push(device);
          }
        });
      }
    });
  }

  AddNewDevice(typeID: string) {
    const type = this.data.deviceTypeMap.get(typeID);
    const device = new Device(type);

    device.name = this.text.DefaultDeviceNames[typeID];

    const numRegex = /[0-9]/;
    let num = 1;

    for (const dev of this.devicesInRoom) {
      const index = dev.name.search(numRegex);
      const prefix = dev.name.substring(0, index);

      if (prefix === device.name) {
        num++;
      }
    }

    device.name = device.name + num;

    device.id = this.roomID + "-" + device.name;
    device.address = device.id + ".byu.edu";
    device.displayName = this.text.DefaultDisplayNames[device.type.id];

    this.devicesInRoom.push(device);
    this.devicesInRoom.sort(this.text.SortDevicesAlphaNum);
  }

  GetValidDropZones(device: Device): string[] {
    const dropZones: string[] = [];

    if (device.type.id === "Pi3") {
      dropZones.push("pi");
    }
    if (device.type.id === "SonyXBR") {
      dropZones.push("display");
    }
    for (const t of this.projectorTypes) {
      if (t.id === device.type.id) {
        dropZones.push("display");
      }
    }
    for (const t of this.inputTypes) {
      if (t.id === device.type.id) {
        dropZones.push("input");
      }
    }
    for (const t of this.audioTypes) {
      if (t.id === device.type.id) {
        dropZones.push("audio");
      }
    }
    return dropZones;
  }

  AddItemToPresetList(presetList: string[], deviceName: string) {
    if (!presetList.includes(deviceName)) {
      presetList.push(deviceName);
      // presetList.sort();
      console.log(this.config);
    }
  }

  RemoveItemFromPresetList(presetList: string[], deviceName: string) {
    if (presetList.includes(deviceName)) {
      presetList.splice(presetList.indexOf(deviceName), 1);
    }
  }

  SetPresetOnPanel(preset: Preset, hostname: string) {
    for (const panel of this.config.panels) {
      if (panel.hostname === hostname) {
        panel.preset = preset.name;
      }
    }
  }
}
