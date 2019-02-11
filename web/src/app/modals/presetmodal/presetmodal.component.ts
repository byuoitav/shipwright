import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { Preset, Panel, UIConfig, DeviceType } from 'src/app/objects';
import { StringsService } from 'src/app/services/strings.service';
import { DataService } from 'src/app/services/data.service';
import { IconModalComponent } from '../iconmodal/iconmodal.component';

export interface UIInfo{
  preset: Preset
  currentPanels: Panel[]
  config: UIConfig
}

@Component({
  selector: 'preset-modal',
  templateUrl: './presetmodal.component.html',
  styleUrls: ['./presetmodal.component.scss']
})
export class PresetModalComponent implements OnInit {
  uipath: string

  constructor(public dialogRef: MatDialogRef<PresetModalComponent>, @Inject(MAT_DIALOG_DATA) public data: UIInfo, public text: StringsService, public dataService: DataService, private dialog: MatDialog) { }

  ngOnInit() {
  }

  Close() {
    this.dialogRef.close()
  }

  UpdatePresetOnPanels() {
    if(this.data.currentPanels != null) {
      for(let p of this.data.currentPanels) {
        p.preset = this.data.preset.name
      }
    }
  }

  UpdateUIPathOnPanels() {
    if(this.data.currentPanels != null) {
      for(let p of this.data.currentPanels) {
        p.uiPath = this.uipath
      }
    }
    if(this.uipath === "/cherry") {
      this.ToggleSharing(false);
    }
  }

  UpdatePresetDisplays(displayName: string, checked: boolean) {
    if(checked && !this.data.preset.displays.includes(displayName)) {
      this.data.preset.displays.push(displayName);
    }

    if(!checked && this.data.preset.displays.includes(displayName)) {
      this.data.preset.displays.splice(this.data.preset.displays.indexOf(displayName), 1)
    }

    this.data.preset.displays.sort(this.SortAlphaNum)
  }

  UpdatePresetAudioDevices(audioName: string, checked: boolean) {
    if(checked && !this.data.preset.audioDevices.includes(audioName)) {
      this.data.preset.audioDevices.push(audioName);
    }

    if(!checked && this.data.preset.audioDevices.includes(audioName)) {
      this.data.preset.audioDevices.splice(this.data.preset.audioDevices.indexOf(audioName), 1)
    }

    this.data.preset.audioDevices.sort(this.SortAlphaNum)
  }

  UpdatePresetShareableDisplays(displayName: string, checked: boolean) {
    if(checked && !this.data.preset.shareableDisplays.includes(displayName)) {
      this.data.preset.shareableDisplays.push(displayName);
    }

    if(!checked && this.data.preset.shareableDisplays.includes(displayName)) {
      this.data.preset.shareableDisplays.splice(this.data.preset.shareableDisplays.indexOf(displayName), 1)
    }

    this.data.preset.shareableDisplays.sort(this.SortAlphaNum)
  }

  UpdatePresetInputs(inputName: string, checked: boolean) {

  } 
  
  UpdatePresetIndependents(audioName: string, checked: boolean) {

  }

  ToggleSharing(checked: boolean) {

  }

  HasSharing(): boolean {
    return false;
  }

  IsADisplay(displayName: string): boolean {
    return false
  }

  IsAnAudioDevice(audioName: string): boolean {
    return false
  }  

  IsAnIndependentAudio(audioName: string): boolean {
    return false
  }

  GetInputs(deviceType: DeviceType) {

  }

  ChangeIcon(caller: any) {
    this.dialog.open(IconModalComponent).afterClosed().subscribe(result => {
      if(result != null) {
        caller.icon = result;
      }
    });
  }

  private SortAlphaNum(a,b) {
    // Sort the array first alphabetically and then numerically.
    let reA: RegExp = /[^a-zA-Z]/g;
    let reN: RegExp = /[^0-9]/g;
    
    let aA = a.replace(reA, "");
    let bA = b.replace(reA, "");

    if(aA === bA) {
        let aN = parseInt(a.replace(reN, ""), 10);
        let bN = parseInt(b.replace(reN, ""), 10);
        return aN === bN ? 0 : aN > bN ? 1 : -1;
    } else {
        return aA > bA ? 1 : -1;
    }
  }
}
