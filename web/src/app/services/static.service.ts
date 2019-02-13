import { Injectable, EventEmitter } from '@angular/core';
import { StringsService } from './strings.service';
import { APIService } from './api.service';
import { StaticDevice } from '../objects';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class StaticService {
  allStaticDevices: StaticDevice[] = [];
  roomToDeviceRecords: Map<string, StaticDevice[]> = new Map();
  
  loaded: EventEmitter<boolean>;
  finished: boolean = false;

  constructor(private text: StringsService, private api: APIService, private data: DataService) {
    this.loaded = new EventEmitter<boolean>();
    if(this.data.finished) {
      this.GetStaticDevices()
    } else {
      this.data.loaded.subscribe(() => {
        this.GetStaticDevices()
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
}
