import { Injectable, OnInit, EventEmitter } from '@angular/core';
import { APIService } from './api.service';
import { Building, Room, Device } from '../objects';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  loaded: EventEmitter<boolean>;
  buildingList: Building[] = [];
  couchBuildingList: Building[] = [];
  elkBuildingList: Building[] = [];

  roomList: Room[] = [];
  couchRoomList: Room[] = [];
  elkRoomList: Room[] = [];

  deviceList: Device[] = [];
  couchDeviceList: Device[] = [];

  buildingToRoomsMap: Map<string, Room[]> = new Map();
  roomToDevicesMap: Map<string, Device[]> = new Map();

  constructor(public api: APIService) {
    this.loaded = new EventEmitter<boolean>();
    this.getBuildings();
    this.getRooms();

  }

  getBuildings() {
    this.api.getAllBuildings().then((resp) => {
      this.couchBuildingList = resp;
      this.buildingList = this.couchBuildingList;
      // TODO: add the buildings from ELK
      this.setBuildingToRoomMap();
    });
  }

  getRooms() {
    this.api.getAllRooms().then((resp) => {
      this.couchRoomList = resp;
      this.roomList = this.couchRoomList;
      // TODO: add the rooms from ELK

      this.setRoomToDeviceMap();
    });
  }

  async setBuildingToRoomMap() {
    let counter: number = 0;
    this.buildingList.forEach(bldg => {
      this.api.getRoomsByBuilding(bldg.id).then((resp) => {
        this.buildingToRoomsMap.set(bldg.id, resp);
        // TODO: put the ELK rooms in this map

        counter++;
        if(counter === this.buildingList.length) {
          this.loaded.emit(true);
        }
      })
    })
  }

  getDevices() {
    this.api.getAllDevices().then((resp) => {
      this.couchDeviceList = resp;
      this.deviceList = this.couchDeviceList;
    })
  }

  setRoomToDeviceMap() {
    this.roomList.forEach(room => {
      this.api.getDevicesByRoom(room.id).then((resp) => {
        this.roomToDevicesMap.set(room.id, resp);
      })
    })
  }
}
