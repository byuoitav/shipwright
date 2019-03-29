import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from "@angular/material";
import { StringsService } from "src/app/services/strings.service";
import { DataService } from "src/app/services/data.service";
import { IconModalComponent } from "../iconmodal/iconmodal.component";
import {
  Preset,
  Panel,
  UIConfig,
  IOConfiguration,
  DeviceType
} from "src/app/objects/database";

export interface UIInfo {
  preset: Preset;
  currentPanels: Panel[];
  config: UIConfig;
}

@Component({
  selector: "preset-modal",
  templateUrl: "./presetmodal.component.html",
  styleUrls: ["./presetmodal.component.scss"]
})
export class PresetModalComponent implements OnInit {
  uipath: string;
  inputTypeMap: Map<string, IOConfiguration[]> = new Map();

  constructor(
    public dialogRef: MatDialogRef<PresetModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UIInfo,
    public text: StringsService,
    public dataService: DataService,
    private dialog: MatDialog
  ) {
    if (this.data.currentPanels != null && this.data.currentPanels.length > 0) {
      this.uipath = this.data.currentPanels[0].uiPath;
    }
    if (this.dataService.finished) {
      this.CreateInputTypeMap();
    } else {
      this.dataService.loaded.subscribe(() => {
        this.CreateInputTypeMap();
      });
    }
  }

  ngOnInit() {}

  Close() {
    this.dialogRef.close();
  }

  UpdatePresetOnPanels() {
    if (this.data.currentPanels != null) {
      for (const p of this.data.currentPanels) {
        p.preset = this.data.preset.name;
      }
    }
  }

  UpdateUIPathOnPanels() {
    if (this.data.currentPanels != null) {
      for (const p of this.data.currentPanels) {
        p.uiPath = this.uipath;
      }
    }
    if (this.uipath === "/cherry") {
      this.ToggleSharing(false);
    }
  }

  UpdatePresetDisplays(displayName: string, checked: boolean) {
    if (checked && !this.data.preset.displays.includes(displayName)) {
      this.data.preset.displays.push(displayName);
    }

    if (!checked && this.data.preset.displays.includes(displayName)) {
      this.data.preset.displays.splice(
        this.data.preset.displays.indexOf(displayName),
        1
      );
    }

    this.data.preset.displays.sort(this.SortAlphaNum);
  }

  UpdatePresetAudioDevices(audioName: string, checked: boolean) {
    if (checked && !this.data.preset.audioDevices.includes(audioName)) {
      this.data.preset.audioDevices.push(audioName);
    }

    if (!checked && this.data.preset.audioDevices.includes(audioName)) {
      this.data.preset.audioDevices.splice(
        this.data.preset.audioDevices.indexOf(audioName),
        1
      );
    }

    this.data.preset.audioDevices.sort(this.SortAlphaNum);
  }

  UpdatePresetShareableDisplays(displayName: string, checked: boolean) {
    if (checked && !this.data.preset.shareableDisplays.includes(displayName)) {
      this.data.preset.shareableDisplays.push(displayName);
    }

    if (!checked && this.data.preset.shareableDisplays.includes(displayName)) {
      this.data.preset.shareableDisplays.splice(
        this.data.preset.shareableDisplays.indexOf(displayName),
        1
      );
    }

    this.data.preset.shareableDisplays.sort(this.SortAlphaNum);
  }

  UpdatePresetInputs(inputName: string, checked: boolean) {
    if (checked && !this.data.preset.inputs.includes(inputName)) {
      this.data.preset.inputs.push(inputName);
    }

    if (!checked && this.data.preset.inputs.includes(inputName)) {
      this.data.preset.inputs.splice(
        this.data.preset.inputs.indexOf(inputName),
        1
      );
    }

    this.data.preset.inputs.sort(this.SortAlphaNum);
  }

  UpdatePresetIndependents(audioName: string, checked: boolean) {
    if (
      checked &&
      !this.data.preset.independentAudioDevices.includes(audioName)
    ) {
      this.data.preset.independentAudioDevices.push(audioName);
    }

    if (
      !checked &&
      this.data.preset.independentAudioDevices.includes(audioName)
    ) {
      this.data.preset.independentAudioDevices.splice(
        this.data.preset.independentAudioDevices.indexOf(audioName),
        1
      );
    }

    this.data.preset.independentAudioDevices.sort(this.SortAlphaNum);
  }

  ToggleSharing(checked: boolean) {
    if (this.data.currentPanels != null) {
      for (const p of this.data.currentPanels) {
        if (checked && !p.features.includes("share")) {
          p.features.push("share");
        }
        if (!checked && p.features.includes("share")) {
          p.features.splice(p.features.indexOf("share"));
        }

        p.features.sort(this.SortAlphaNum);
      }
    }
  }

  HasSharing(): boolean {
    if (this.data.currentPanels != null) {
      for (const p of this.data.currentPanels) {
        if (p.features.includes("share")) {
          return true;
        }
      }
    }
    return false;
  }

  IsADisplay(displayName: string): boolean {
    const device = this.dataService.GetDevice(
      this.data.config.id + "-" + displayName
    );

    const dType = this.dataService.deviceTypeMap.get(device.type.id);

    if (dType.tags.includes("display")) {
      return this.dataService.DeviceHasRole(device, "VideoOut");
    }

    return false;
  }

  IsAnAudioDevice(audioName: string): boolean {
    const device = this.dataService.GetDevice(
      this.data.config.id + "-" + audioName
    );

    const dType = this.dataService.deviceTypeMap.get(device.type.id);

    if (dType.tags.includes("display")) {
      return this.dataService.DeviceHasRole(device, "AudioOut");
    }

    return false;
  }

  RoomHasIndependentAudios(): boolean {
    if (
      this.data.config == null ||
      this.dataService.roomToDevicesMap.get(this.data.config.id) == null
    ) {
      return false;
    }

    for (const dev of this.dataService.roomToDevicesMap.get(
      this.data.config.id
    )) {
      if (this.dataService.DeviceHasRole(dev, "Microphone")) {
        return true;
      }
    }

    return false;
  }

  GetInputs(deviceType: DeviceType) {
    return this.inputTypeMap.get(deviceType.id);
  }

  CreateInputTypeMap() {
    if (this.data.config == null) {
      return;
    }

    this.inputTypeMap.clear();

    for (const input of this.data.config.inputConfiguration) {
      for (const dev of this.dataService.roomToDevicesMap.get(
        this.data.config.id
      )) {
        if (
          dev.name === input.name &&
          this.dataService.deviceTypeMap.get(dev.type.id).input
        ) {
          if (this.inputTypeMap.get(dev.type.id) == null) {
            this.inputTypeMap.set(dev.type.id, [input]);
          } else {
            this.inputTypeMap.get(dev.type.id).push(input);
          }
        }
      }
    }
  }

  ChangeIcon(caller: any) {
    this.dialog
      .open(IconModalComponent)
      .afterClosed()
      .subscribe(result => {
        if (result != null) {
          caller.icon = result;
        }
      });
  }

  HasShareableDisplays(preset: Preset): boolean {
    for (const out of this.data.config.outputConfiguration) {
      if (this.IsADisplay(out.name)) {
        if (!preset.displays.includes(out.name)) {
          return true;
        }
      }
    }
    return false;
  }

  private SortAlphaNum(a, b) {
    // Sort the array first alphabetically and then numerically.
    const reA: RegExp = /[^a-zA-Z]/g;
    const reN: RegExp = /[^0-9]/g;

    const aA = a.replace(reA, "");
    const bA = b.replace(reA, "");

    if (aA === bA) {
      const aN = parseInt(a.replace(reN, ""), 10);
      const bN = parseInt(b.replace(reN, ""), 10);
      return aN === bN ? 0 : aN > bN ? 1 : -1;
    } else {
      return aA > bA ? 1 : -1;
    }
  }
}
