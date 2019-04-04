import { Component, OnInit, HostListener } from "@angular/core";
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
  IOConfiguration,
  DBResponse
} from "src/app/objects/database";
import { ComponentCanDeactivate } from "src/app/pending-changes.guard";
import { Observable } from "rxjs";
import { APIService } from "src/app/services/api.service";

@Component({
  selector: "builder",
  templateUrl: "./builder.component.html",
  styleUrls: ["./builder.component.scss"]
})
export class BuilderComponent implements OnInit, ComponentCanDeactivate {
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

  baseDevices: Device[] = [];
  baseUIConfig: UIConfig = new UIConfig();
  @HostListener("window:beforeunload", ["$event"])
  canDeactivate(): boolean | Observable<boolean> {
    if (this.PageDataHasChanged()) {
      return false;
    }

    return true;
  }

  constructor(
    public text: StringsService,
    public data: DataService,
    private route: ActivatedRoute,
    public modal: ModalService,
    public api: APIService
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

    // window.onbeforeunload = () => {
    //   if (this.PageDataHasChanged()) {
    //     window.confirm("You have unsaved changes, would you still like to leave the page?");
    //   }
    // };
  }

  ngOnInit() {}

  private GetRoomInfo() {
    this.room = this.data.GetRoom(this.roomID);

    this.devicesInRoom = this.data.roomToDevicesMap.get(this.roomID);
    this.baseDevices = this.devicesInRoom;

    this.filteredDevices = this.devicesInRoom;

    this.config = this.data.roomToUIConfigMap.get(this.roomID);
    if (this.config == null) {
      this.config = new UIConfig();
    }
    this.baseUIConfig = this.config;

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

  AddNewPreset(hostname: string) {
    const preset = new Preset();
    preset.name = "Preset " + (this.config.presets.length + 1);
    preset.icon = "tv";
    this.config.presets.push(preset);

    this.SetPresetOnPanel(preset, hostname);
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

  UpdateUIPathOnPanels(preset: Preset) {
    for (const panel of this.config.panels) {
      if (panel.preset === preset.name) {
        if (panel.uiPath == null || panel.uiPath.length === 0) {
          if (preset.displays.length > 1) {
            panel.uiPath = "/cherry";
          } else {
            panel.uiPath = "/blueberry";
          }
        }
      }
    }
  }

  SetPresetOnPanel(preset: Preset, hostname: string) {
    let panelExists = false;
    for (const panel of this.config.panels) {
      if (panel.hostname === hostname) {
        panel.preset = preset.name;
        panelExists = true;
      }
    }
    if (!panelExists) {
      const p = new Panel();
      p.hostname = hostname;
      p.preset = preset.name;
      p.features = [];
      if (preset.displays.length > 1) {
        p.uiPath = "/cherry";
      } else {
        p.uiPath = "/blueberry";
      }
      this.config.panels.push(p);
    }
  }

  GetDeviceIcon(device: Device) {
    for (const io of this.config.inputConfiguration) {
      if (io.name === device.name) {
        return io.icon;
      }
    }
    for (const io of this.config.outputConfiguration) {
      if (io.name === device.name) {
        return io.icon;
      }
    }

    return this.text.DefaultIcons[device.type.id];
  }

  SavePageData() {
    let submissionCount = 0;
    const results: DBResponse[] = [];
    for (const newDev of this.devicesInRoom) {
      // console.log(newDev);
      let present = false;
      for (const oldDev of this.baseDevices) {
        // console.log("oldDev is %s", oldDev.id);
        if (oldDev.id === newDev.id) {
          present = true;
          if (!oldDev.Equals(newDev)) {
            submissionCount++;
            console.log("updating %s", newDev.id);
            this.api.UpdateDevice(oldDev.id, newDev).then((result) => {
              results.push(result);
            });
          }
        }
      }
      if (!present) {
        submissionCount++;
        console.log("adding %s", newDev.id);
        this.api.AddDevice(newDev).then((result) => {
          results.push(result);
        });
      }
    }

    // if (!this.baseUIConfig.Equals(this.config)) {
      console.log("uiconfig not equal");
      if (this.baseUIConfig.id == null || this.baseUIConfig.id.length === 0) {
        submissionCount++;
        this.api.AddUIConfig(this.config).then((result) => {
          results.push(result);
        });
      } else {
        submissionCount++;
        this.api.UpdateUIConfig(this.baseUIConfig.id, this.config).then((result) => {
          results.push(result);
        });
      }
    // }
  }

  public PageDataHasChanged(): boolean {
    for (const baseDev of this.baseDevices) {
      let found = false;
      for (const dev of this.devicesInRoom) {
        if (dev.id === baseDev.id) {
          found = true;
          if (!baseDev.Equals(dev)) {
            // device was changed in some way
            return true;
          }
        }
      }
      if (!found) {
        // device in the starting list was not found in the modified list
        return true;
      }
    }

    if (!this.baseUIConfig.Equals(this.config)) {
      // uiconfig is different in some way
      return true;
    }

    // apparently nothing has changed
    return false;
  }
}
