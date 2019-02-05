import { Injectable } from '@angular/core';
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

  constructor(private text: StringsService, private api: APIService, private data: DataService) {
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
    });
  }
}
