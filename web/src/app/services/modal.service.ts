import { Injectable, EventEmitter } from "@angular/core";
import { MatDialog } from "@angular/material";
import { SettingsModalComponent } from "../modals/settings/settings.component";
import { BuildingModalComponent } from "../modals/buildingmodal/buildingmodal.component";
import { RoomModalComponent } from "../modals/roommodal/roommodal.component";
import { DeviceModalComponent } from "../modals/devicemodal/devicemodal.component";
import { NotifyModalComponent } from "../modals/notify/notify.component";
import { PresetModalComponent } from "../modals/presetmodal/presetmodal.component";
import { IconModalComponent } from "../modals/iconmodal/iconmodal.component";
import { ResponseModalComponent } from "../modals/responsemodal/responsemodal.component";
import { MaintenanceModalComponent } from "../modals/maintenancemodal/maintenancemodal.component";
import { RoomIssue, Alert } from "../objects/alerts";
import {
  Building,
  Room,
  Device,
  DBResponse,
  Preset,
  Panel,
  UIConfig
} from "../objects/database";
import { APIService } from "./api.service";
import { HelpModalComponent } from "../modals/helpmodal/helpmodal.component";

@Injectable({
  providedIn: "root"
})
export class ModalService {
  buildingDone: EventEmitter<Building>;
  roomDone: EventEmitter<Room>;
  deviceDone: EventEmitter<Device>;

  constructor(private dialog: MatDialog, private api: APIService) {
    this.buildingDone = new EventEmitter();
    this.roomDone = new EventEmitter();
    this.deviceDone = new EventEmitter();
  }

  OpenSettingsModal() {
    this.dialog.open(SettingsModalComponent);
  }

  OpenBuildingModal(building: Building) {
    this.dialog
      .open(BuildingModalComponent, { data: building })
      .afterClosed()
      .subscribe(resp => {
        if (resp != null) {
          // this.OpenNotifyModal(resp);
          this.buildingDone.emit(building);
        }
      });
  }

  OpenRoomModal(room: Room) {
    this.dialog
      .open(RoomModalComponent, { data: room })
      .afterClosed()
      .subscribe(resp => {
        if (resp != null) {
          // this.OpenNotifyModal(resp);
          this.roomDone.emit(room);
        }
      });
  }

  OpenDeviceModal(device: Device, deviceList?: Device[]) {
    console.log(device);
    this.dialog.open(DeviceModalComponent, { data: {device: device, devicesInRoom: deviceList} })
    .afterClosed()
    .subscribe(resp => {
      if (resp != null) {
        this.deviceDone.emit(device);
      }
    });
  }

  OpenNotifyModal(resp: DBResponse[]) {
    this.dialog.open(NotifyModalComponent, { data: resp });
  }

  OpenPresetModal(preset: Preset, cps: Panel[], config: UIConfig) {
    this.dialog.open(PresetModalComponent, {
      data: { preset: preset, currentPanels: cps, config: config }
    });
  }

  OpenIconModal(caller: any) {
    this.dialog
      .open(IconModalComponent)
      .afterClosed()
      .subscribe(result => {
        if (result != null) {
          caller.icon = result;
        }
      });
  }

  OpenResponseModal() {
    this.dialog.open(ResponseModalComponent);
  }

  OpenMaintenanceModal(roomID: string) {
    this.dialog
      .open(MaintenanceModalComponent, { data: roomID })
      .afterClosed()
      .subscribe(result => {
        if (result != null) {
          this.api.SetMaintenanceMode(result.roomID, result);
        }
      });
  }

  OpenHelpModal() {
    this.dialog.open(HelpModalComponent);
  }
}
