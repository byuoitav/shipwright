import { Injectable, EventEmitter } from '@angular/core';
import { StringsService } from './strings.service';
import { APIService } from './api.service';
import { StaticDevice, Alert } from '../objects';
import { DataService } from './data.service';
import { MonitoringService } from './monitoring.service';

export class FakeStaticRoom {
  roomID: string
  alerts: Alert[]
  staticDevices: StaticDevice[] = [];
}

@Injectable({
  providedIn: 'root'
})
export class StaticService {
  allStaticDevices: StaticDevice[] = [];
  roomToDeviceRecords: Map<string, StaticDevice[]> = new Map();
  staticRoomList: FakeStaticRoom[] = [];
  
  loaded: EventEmitter<boolean>;
  finished: boolean = false;

  constructor(private text: StringsService, private api: APIService, private data: DataService, private monitor: MonitoringService) {
    this.loaded = new EventEmitter<boolean>();
    if(this.data.finished) {
      this.GetStaticDevices()
      this.SetListOfFakeStaticRooms()
    } else {
      this.data.loaded.subscribe(() => {
        this.GetStaticDevices()
        this.SetListOfFakeStaticRooms()
      })
    }
  }

  private async GetStaticDevices() {
    this.allStaticDevices = [];
    this.roomToDeviceRecords.clear();

    await this.api.GetAllStaticDeviceRecords().then((records) => {
      this.allStaticDevices = records;

      for(let sd of this.allStaticDevices) {
        for(let room of this.data.allRooms) {
          if(sd.room === room.id) {
            if(this.roomToDeviceRecords.get(room.id) == null) {
              this.roomToDeviceRecords.set(room.id, [sd])
            } else {
              this.roomToDeviceRecords.get(room.id).push(sd)
            }
            break
          }
        }
      }
      this.loaded.emit(true);
      this.finished = true;
    });
  }

  GetSingleStaticDevice(deviceID: string) {
    let roomID = deviceID.substring(0, deviceID.lastIndexOf("-"))

    let roomRecords = this.roomToDeviceRecords.get(roomID)

    if(roomRecords != null) {
      for(let record of roomRecords) {
        if(record.deviceID === deviceID) {
          return record
        }
      }
    }

    return null
  }

  SetListOfFakeStaticRooms() {
    let list: FakeStaticRoom[] = []

    this.roomToDeviceRecords.forEach((v, k) => {
      let fsr = new FakeStaticRoom()

      fsr.roomID = k
      fsr.alerts = this.monitor.roomAlertsMap.get(k).GetAlerts();
      fsr.staticDevices = v

      list.push(fsr);
    })

    this.staticRoomList = list;
  }
}
