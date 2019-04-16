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
  DBResponse,
  Template,
  Port
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

  tvTypes: DeviceType[] = [];
  projectorTypes: DeviceType[] = [];
  inputTypes: DeviceType[] = [];
  audioTypes: DeviceType[] = [];
  videoSwitcherTypes: DeviceType[] = [];
  otherTypes: DeviceType[] = [];

  templates: Template[] = [];

  tvSizes: string[] = [`"43`, `"55`, `"65`, `"75`];

  baseDevices: Device[] = [];
  baseUIConfig: UIConfig = new UIConfig();
  newUIConfig = false;

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
    /*
     *TODO
     *Add missing ports to devices from device types
     */
    this.templates = this.data.templateList;

    this.room = this.data.GetRoom(this.roomID);

    this.devicesInRoom = this.data.roomToDevicesMap.get(this.roomID);
    if (this.devicesInRoom != null && this.devicesInRoom.length > 0) {
      this.baseDevices.push(...this.devicesInRoom);
    } else {
      this.baseDevices = [];
    }

    this.filteredDevices = this.devicesInRoom;

    this.config = this.data.roomToUIConfigMap.get(this.roomID);
    if (this.config == null) {
      this.config = new UIConfig();
      this.config.id = this.roomID;
      this.newUIConfig = true;
    }
    this.baseUIConfig = JSON.parse(JSON.stringify(this.config)) as UIConfig;

    if (this.baseUIConfig == null) {
      this.baseUIConfig = new UIConfig(this.roomID);
    }

    this.FillMissingUIConfigInfo();
    this.SetDeviceTypeLists();
  }

  FillMissingUIConfigInfo() {
    if (this.devicesInRoom == null || this.devicesInRoom.length === 0) {
      return;
    }
    // if missing output configuration
    if (
      this.config.outputConfiguration == null ||
      this.config.outputConfiguration.length === 0
    ) {
      this.config.outputConfiguration = [];
      for (const dev of this.devicesInRoom) {
        if (!this.config.outputConfiguration.some(io => io.name === dev.name)) {
          if (
            this.data.DeviceHasRole(dev, "VideoOut") ||
            this.data.DeviceHasRole(dev, "Microphone")
          ) {
            this.config.outputConfiguration.push(
              new IOConfiguration(dev.name, this.text.DefaultIcons[dev.type.id])
            );
          }
        }
      }
    }
    // if missing input configuration
    if (
      this.config.inputConfiguration == null ||
      this.config.inputConfiguration.length === 0
    ) {
      this.config.inputConfiguration = [];
      for (const dev of this.devicesInRoom) {
        if (!this.config.inputConfiguration.some(io => io.name === dev.name)) {
          if (this.data.deviceTypeMap.get(dev.type.id).input) {
            this.config.inputConfiguration.push(
              new IOConfiguration(dev.name, this.text.DefaultIcons[dev.type.id])
            );
          }
        }
      }
    }
  }

  GetPresetUIPath(presetName: string, trim: boolean) {
    for (let i = 0; i < this.config.panels.length; i++) {
      if (this.config.panels[i].preset === presetName) {
        if (
          this.config.panels[i].uiPath !== null &&
          this.config.panels[i].uiPath !== undefined
        ) {
          if (!trim) {
            return this.config.panels[i].uiPath;
          } else {
            return this.config.panels[i].uiPath.substr(1);
          }
        }
      }
    }
  }

  GetDeviceByName(name: string): Device {
    for (let i = 0; i < this.devicesInRoom.length; i++) {
      if (this.devicesInRoom[i].name === name) {
        return this.devicesInRoom[i];
      }
    }
  }

  GetDeviceByID(id: string): Device {
    for (const device of this.devicesInRoom) {
      if (device.id === id) {
        return device;
      }
    }
  }

  GetIOConfig(devName: string): IOConfiguration {
    for (const io of this.config.inputConfiguration) {
      if (io.name === devName) {
        return io;
      }
    }
    for (const io of this.config.outputConfiguration) {
      if (io.name === devName) {
        return io;
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
    this.tvTypes = [];
    this.projectorTypes = [];
    this.inputTypes = [];
    this.audioTypes = [];
    this.videoSwitcherTypes = [];
    this.otherTypes = [];

    for (const type of this.data.deviceTypeList) {
      if (type.tags.includes("tv")) {
        this.tvTypes.push(type);
      } else if (type.tags.includes("projector")) {
        this.projectorTypes.push(type);
      } else if (type.input) {
        this.inputTypes.push(type);
      } else if (type.tags.includes("audio")) {
        this.audioTypes.push(type);
      } else if (type.tags.includes("video-switcher")) {
        this.videoSwitcherTypes.push(type);
      } else {
        this.otherTypes.push(type);
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

  AddNewDevice(typeID: string): Device {
    const type = this.data.deviceTypeMap.get(typeID);
    const device = new Device(type);

    device.name = this.text.DefaultDeviceNames[typeID];

    const numRegex = /[0-9]/;
    let num = 1;

    if (this.devicesInRoom != null && this.devicesInRoom.length > 0) {
      for (const dev of this.devicesInRoom) {
        const index = dev.name.search(numRegex);
        const prefix = dev.name.substring(0, index);
        if (prefix === device.name) {
          num++;
        }
      }
    } else {
      this.devicesInRoom = [];
    }

    device.name = device.name + num;

    device.id = this.roomID + "-" + device.name;
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

    this.devicesInRoom.push(device);
    this.devicesInRoom.sort(this.text.SortDevicesAlphaNum);

    if (this.data.deviceTypeMap.get(device.type.id).output) {
      let found = false;
      for (const io of this.config.outputConfiguration) {
        if (io.name === device.name) {
          found = true;
        }
      }
      if (!found) {
        this.config.outputConfiguration.push(
          new IOConfiguration(
            device.name,
            this.text.DefaultIcons[device.type.id]
          )
        );
      }
    }
    if (this.data.deviceTypeMap.get(device.type.id).input) {
      let found = false;
      for (const io of this.config.inputConfiguration) {
        if (io.name === device.name) {
          found = true;
        }
      }
      if (!found) {
        this.config.inputConfiguration.push(
          new IOConfiguration(
            device.name,
            this.text.DefaultIcons[device.type.id]
          )
        );
      }
    }
    if (device.type.id === "Pi3") {
      let found = false;
      for (const panel of this.config.panels) {
        if (panel.hostname === device.id) {
          found = true;
        }
      }
      if (!found) {
        this.config.panels.push(new Panel(device.id));
      }
    }

    this.SearchDevices();

    return device;
  }

  AddTemplate(template: Template) {
    const templateUIConfig = JSON.parse(JSON.stringify(template.uiconfig));
    for (const type of template.baseTypes) {
      const dev = this.AddNewDevice(type);

      let used = false;

      for (let i = 0; i < templateUIConfig.presets.length; i++) {
        const preset = templateUIConfig.presets[i];

        if (used) {
          break;
        }
        if (
          preset.displays.includes(dev.type.id) &&
          !preset.displays.includes(dev.name)
        ) {
          preset.displays[preset.displays.indexOf(dev.type.id)] = dev.name;
          used = true;
        }
        if (
          preset.audioDevices.includes(dev.type.id) &&
          !preset.audioDevices.includes(dev.name)
        ) {
          preset.audioDevices[preset.audioDevices.indexOf(dev.type.id)] =
            dev.name;
          used = true;
        }
        if (
          preset.independentAudioDevices.includes(dev.type.id) &&
          !preset.independentAudioDevices.includes(dev.name)
        ) {
          preset.independentAudioDevices[
            preset.independentAudioDevices.indexOf(dev.type.id)
          ] = dev.name;
          used = true;
        }
        if (
          preset.inputs.includes(dev.type.id) &&
          !preset.inputs.includes(dev.name)
        ) {
          preset.inputs[preset.inputs.indexOf(dev.type.id)] = dev.name;
          used = true;
        }
      }

      for (const panel of templateUIConfig.panels) {
        if (used) {
          break;
        }
        if (panel.hostname === dev.type.id && !used) {
          panel.hostname = dev.id;
          used = true;
        }
      }
    }
    for (let j = 0; j < templateUIConfig.presets.length; j++) {
      const preset: Preset = new Preset();
      preset.name = templateUIConfig.presets[j].name;
      preset.audioDevices = templateUIConfig.presets[j].audioDevices;
      preset.displays = templateUIConfig.presets[j].displays;
      preset.inputs = templateUIConfig.presets[j].inputs;
      preset.icon = templateUIConfig.presets[j].icon;
      preset.independentAudioDevices =
        templateUIConfig.presets[j].independentAudioDevices;
      preset.shareableDisplays = templateUIConfig.presets[j].shareableDisplays;

      const oldPresetName = preset.name;

      preset.name = preset.name + " " + (this.config.presets.length + j + 1);

      for (const panel of templateUIConfig.panels) {
        if (panel.preset === oldPresetName) {
          panel.preset = preset.name;
        }
      }

      console.log(preset);
      this.config.presets.push(preset);
    }
    for (const tempPanel of templateUIConfig.panels) {
      let found = false;
      for (const panel of this.config.panels) {
        if (panel.hostname === tempPanel.hostname) {
          panel.preset = tempPanel.preset;
          panel.uiPath = tempPanel.uiPath;
          panel.features = tempPanel.features;
          found = true;
        }
      }
      if (!found) {
        this.config.panels.push(tempPanel);
      }
    }
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
    for (const device of this.devicesInRoom) {
      let found = false;
      for (const baseDev of this.baseDevices) {
        if (device.id === baseDev.id) {
          found = true;
          if (!baseDev.Equals(device)) {
            console.log("updating device %s", device.id);
            this.RemoveExcessPorts(device);
            this.api.UpdateDevice(baseDev.id, device);
          }
        }
      }
      if (!found) {
        console.log("adding device %s", device.id);
        this.RemoveExcessPorts(device);
        this.api.AddDevice(device);
      }
    }

    if (this.newUIConfig) {
      console.log("adding ui config", this.config);
      this.api.AddUIConfig(this.config);
    } else {
      console.log("updating ui config", this.config);
      this.api.UpdateUIConfig(this.config.id, this.config);
    }

    this.baseDevices = [];
    this.baseDevices.push(...this.devicesInRoom);

    this.baseUIConfig = JSON.parse(JSON.stringify(this.config));
    // /*
    //  * TODO
    //  * Strip extra ports when saving devices
    //  */
    // let submissionCount = 0;
    // const results: DBResponse[] = [];
    // for (const newDev of this.devicesInRoom) {
    //   let present = false;
    //   for (const oldDev of this.baseDevices) {
    //     if (oldDev.id === newDev.id) {
    //       present = true;
    //       if (!oldDev.Equals(newDev)) {
    //         submissionCount++;
    //         console.log("updating %s", newDev.id);
    //         this.api.UpdateDevice(oldDev.id, newDev).then(result => {
    //           results.push(result);
    //         });
    //       }
    //     }
    //   }
    //   if (!present) {
    //     submissionCount++;
    //     console.log("adding %s", newDev.id);
    //     this.api.AddDevice(newDev).then(result => {
    //       results.push(result);
    //     });
    //   }
    // }
    // // if (!this.baseUIConfig.Equals(this.config)) {
    // console.log("uiconfig not equal");
    // if (this.baseUIConfig.id == null || this.baseUIConfig.id.length === 0) {
    //   submissionCount++;
    //   this.api.AddUIConfig(this.config).then(result => {
    //     results.push(result);
    //   });
    // } else {
    //   submissionCount++;
    //   this.api
    //     .UpdateUIConfig(this.baseUIConfig.id, this.config)
    //     .then(result => {
    //       results.push(result);
    //     });
    // }
    // // }
  }

  public PageDataHasChanged(): boolean {
    if (this.baseDevices === null || this.baseDevices.length === 0) {
      if (this.devicesInRoom.length > 0) {
        return true;
      }
    } else {
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
    }

    if (!this.config.Equals(this.baseUIConfig)) {
      // uiconfig is different in some way
      return true;
    }
    console.log(this.config);
    console.log(this.baseUIConfig);
    // apparently nothing has changed
    return false;
  }

  RevertChanges() {
    if (this.PageDataHasChanged()) {
      this.devicesInRoom = [];
      this.devicesInRoom.push(...this.baseDevices);
      this.filteredDevices = this.devicesInRoom;
      this.config = JSON.parse(JSON.stringify(this.baseUIConfig));
    }
  }

  PortsAreFine(deviceName: string): boolean {
    for (const d of this.devicesInRoom) {
      if (d.name === deviceName) {
        if (d.ports == null || d.ports.length === 0) {
          return true;
        } else {
          for (const p of d.ports) {
            if (
              p.sourceDevice != null &&
              p.sourceDevice.length > 0 &&
              p.destinationDevice != null &&
              p.destinationDevice.length > 0
            ) {
              return true;
            }
          }
          // no ports are set
          return false;
        }
      }
    }
  }

  AddMissingPorts(device: Device) {
    const type = this.data.deviceTypeMap.get(device.type.id);

    if (type.ports != null && type.ports.length > 0) {
      for (const typePort of type.ports) {
        if (device.ports == null) {
          device.ports = [];
        }

        let found = false;

        for (const devPort of device.ports) {
          if (devPort.id === typePort.id) {
            found = true;
          }
        }

        if (!found) {
          device.ports.push(typePort);
        }
      }
      device.ports.sort(this.text.SortAlphaNumByID);
    }
  }

  RemoveExcessPorts(device: Device) {
    if (device.ports !== null && device.ports.length > 0) {
      const portsToKeep: Port[] = [];

      for (const port of device.ports) {
        if (
          port.sourceDevice !== null &&
          port.sourceDevice !== undefined &&
          port.destinationDevice !== null &&
          port.destinationDevice !== undefined
        ) {
          portsToKeep.push(port);
        }
      }

      console.log(portsToKeep);

      device.ports = portsToKeep;
      device.ports.sort(this.text.SortAlphaNumByID);
    }
  }
}
