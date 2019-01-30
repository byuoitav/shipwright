import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { SettingsModalComponent } from '../modals/settings/settings.component';
import { RespondModalComponent } from '../modals/respond/respond.component';
import { BuildingModalComponent } from '../modals/buildingmodal/buildingmodal.component';
import { RoomModalComponent } from '../modals/roommodal/roommodal.component';
import { DeviceModalComponent } from '../modals/devicemodal/devicemodal.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(private dialog: MatDialog) { }

  OpenSettingsModal() {
    this.dialog.open(SettingsModalComponent);
  }

  OpenRespondModal() {
    this.dialog.open(RespondModalComponent);
  }

  OpenBuildingModal() {
    this.dialog.open(BuildingModalComponent);
  }

  OpenRoomModal() {
    this.dialog.open(RoomModalComponent);
  }

  OpenDeviceModal() {
    this.dialog.open(DeviceModalComponent);
  }
}
