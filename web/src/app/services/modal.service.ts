import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { SettingsModalComponent } from '../modals/settings/settings.component';
import { RespondModalComponent } from '../modals/respond/respond.component';
import { BuildingModalComponent } from '../modals/buildingmodal/buildingmodal.component';
import { RoomModalComponent } from '../modals/roommodal/roommodal.component';
import { DeviceModalComponent } from '../modals/devicemodal/devicemodal.component';
import { Building, Room, Device, AlertRow, DBResponse } from '../objects';
import { NotifyModalComponent } from '../modals/notify/notify.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(private dialog: MatDialog) { }

  OpenSettingsModal() {
    this.dialog.open(SettingsModalComponent).afterClosed().subscribe(() => {
      // window.location.reload();
    })
  }

  OpenRespondModal(alertRow: AlertRow) {
    this.dialog.open(RespondModalComponent, {data: alertRow});
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
}
