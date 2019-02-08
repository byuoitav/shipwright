import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { SettingsModalComponent } from '../modals/settings/settings.component';
import { RespondModalComponent } from '../modals/respond/respond.component';
import { BuildingModalComponent } from '../modals/buildingmodal/buildingmodal.component';
import { RoomModalComponent } from '../modals/roommodal/roommodal.component';
import { DeviceModalComponent } from '../modals/devicemodal/devicemodal.component';
import { Building, Room, Device, DBResponse, RoomAlerts, UIConfig } from '../objects';
import { NotifyModalComponent } from '../modals/notify/notify.component';
import { PresetModalComponent } from '../modals/presetmodal/presetmodal.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(private dialog: MatDialog) { }

  OpenSettingsModal() {
    this.dialog.open(SettingsModalComponent);
  }

  OpenRespondModal(ra: RoomAlerts) {
    this.dialog.open(RespondModalComponent, {data: ra});
  }

  OpenBuildingModal(building: Building) {
    this.dialog.open(BuildingModalComponent, {data: building}).afterClosed().subscribe((resp) => {
      if (resp != null){
        this.OpenNotifyModal(resp)
      }
    })
  }

  OpenRoomModal(room: Room) {
    this.dialog.open(RoomModalComponent, {data: room}).afterClosed().subscribe((resp) => {
      if (resp != null){
        this.OpenNotifyModal(resp)
      }
    })
  }

  OpenDeviceModal(device: Device) {
    this.dialog.open(DeviceModalComponent, {data: device});
  }

  OpenNotifyModal(resp: DBResponse) {
    this.dialog.open(NotifyModalComponent, {data: resp});
  }

  OpenPresetModal(presetName: string, config: UIConfig) {
    this.dialog.open(PresetModalComponent, {data: {presetName: presetName, uiConfig: config}})
  }
}
