import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { SettingsModalComponent } from '../modals/settings/settings.component';
import { RespondModalComponent } from '../modals/respond/respond.component';
import { BuildingModalComponent } from '../modals/buildingmodal/buildingmodal.component';
import { RoomModalComponent } from '../modals/roommodal/roommodal.component';
import { DeviceModalComponent } from '../modals/devicemodal/devicemodal.component';
import { Building, Room, Device } from '../objects';

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

  OpenBuildingModal(building: Building) {
    this.dialog.open(BuildingModalComponent, {data: building});
  }

  OpenRoomModal(room: Room) {
    this.dialog.open(RoomModalComponent, {data: room});
  }

  OpenDeviceModal(device: Device) {
    this.dialog.open(DeviceModalComponent, {data: device});
  }
}
