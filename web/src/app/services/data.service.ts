import { Injectable, EventEmitter } from '@angular/core';
import { APIService } from './api.service';
import { Building, Room, Device, DeviceType, Role, RoomConfiguration, UIConfig, Template } from '../objects';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  allBuildings: Building[] = [];
  allRooms: Room[] = [];
  allDevices: Device[] = [];
  allUIConfigs: UIConfig[] = [];

  deviceTypeList: DeviceType[] = [];
  deviceTypeMap: Map<string, DeviceType> = new Map();
  deviceRoles: Role[] = [];
  roomConfigurations: RoomConfiguration[] = [];
  roomDesignations: string[] = [];
  templateList: Template[] = [];

  buildingToRoomsMap: Map<string, Room[]> = new Map();
  roomToDevicesMap: Map<string, Device[]> = new Map();
  roomToUIConfigMap: Map<string, UIConfig> = new Map();

  loaded: EventEmitter<boolean>;
  finished: boolean = false;

  constructor(public api: APIService) {
    this.loaded = new EventEmitter<boolean>();
    this.loadData();
  }

  private async loadData() {
    await this.getAllBuildings();
    await this.getAllRooms();
    await this.getAllDevices();
    await this.getAllUIConfigs();
    await this.getAllDeviceTypes();
    await this.getAllDeviceRoles();
    await this.getAllTemplates();
    await this.getAllRoomConfigurations();
    await this.getAllRoomDesignations();
    await this.setBuildingToRoomsMap();
    await this.setRoomToDevicesMap();
    this.finished = true;
    this.loaded.emit(true);
  }

  private async getAllBuildings() {
    this.allBuildings = [];

    await this.api.getAllBuildings().then((buildings) => {
      this.allBuildings = buildings;
    })
  }

  private async getAllRooms() {
    this.allRooms = [];
    this.buildingToRoomsMap.clear();

    await this.api.getAllRooms().then((rooms) => {
      this.allRooms = rooms;
    });
  }

  private async getAllDevices() {
    this.allDevices = [];
    this.roomToDevicesMap.clear();

    await this.api.getAllDevices().then((devices) => {
      this.allDevices = devices;
    });
  }

  private async getAllDeviceTypes() {
    this.deviceTypeList = [];
    this.deviceTypeMap.clear();

    await this.api.getDeviceTypes().then((types) => {
      this.deviceTypeList = types;

      for(let type of this.deviceTypeList) {
        this.deviceTypeMap.set(type.id, type);
      }
    });
  }

  private async getAllRoomConfigurations() {
    this.roomConfigurations = [];

    await this.api.getRoomConfigurations().then((configurations) => {
      this.roomConfigurations = configurations;
    });
  }

  private async getAllRoomDesignations() {
    this.roomDesignations = [];

    this.api.getRoomDesignations().then((designations) => {
      this.roomDesignations = designations as string[];
    });
  }

  private async getAllUIConfigs() {
    this.allUIConfigs = [];
    this.roomToUIConfigMap.clear();

    await this.api.getAllUIConfigs().then((configs) => {
      this.allUIConfigs = configs;

      for(let config of this.allUIConfigs) {
        this.roomToUIConfigMap.set(config.id, config);
      }
    });
  }

  private async getAllDeviceRoles() {
    this.deviceRoles = [];

    this.api.getDeviceRoles().then((roles) => {
      this.deviceRoles = roles;
    });
  }

  private async getAllTemplates() {
    this.templateList = [];

    this.api.getTemplates().then((list) => {
      this.templateList = list;
    });
  }

  private async setBuildingToRoomsMap() {
    for(let room of this.allRooms) {
      for(let building of this.allBuildings) {
        if(room.id.includes(building.id)) {
          if(this.buildingToRoomsMap.get(building.id) == null) {
            this.buildingToRoomsMap.set(building.id, [room]);
          } else {
            this.buildingToRoomsMap.get(building.id).push(room);
          }
          break
        }
      }
    }
  }

  private async setRoomToDevicesMap() {
    for(let device of this.allDevices) {
      for(let room of this.allRooms) {
        if(device.id.includes(room.id)) {
          if(this.roomToDevicesMap.get(room.id) == null) {
            this.roomToDevicesMap.set(room.id, [device]);
          } else {
            this.roomToDevicesMap.get(room.id).push(device);
          }
          break
        }
      }
    }
  }

  getBuilding(buildingID: string): Building {
    for(let building of this.allBuildings) {
      if(buildingID == building.id) {
        return building;
      }
    }
  }

  getRoom(roomID: string): Room {
    let buildingID = roomID.split("-")[0]

    if(this.buildingToRoomsMap.get(buildingID) != null) {
      for(let room of this.buildingToRoomsMap.get(buildingID)) {
        if(roomID == room.id) {
          return room;
        }
      }
    }
  }

  getDevice(deviceID: string): Device {
    let deviceSplit = deviceID.split("-")
    let roomID = deviceSplit[0] + "-" + deviceSplit[1]

    if(this.roomToDevicesMap.get(roomID) != null) {
      for(let device of this.roomToDevicesMap.get(roomID)) {
        if(deviceID == device.id) {
          return device
        }
      }
    }
  }

  deviceHasRole(device: Device, role: string): boolean {
    for(let r of device.roles) {
      if(r.id === role) {
        return true;
      }
    }

    return false;
  }
}
