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
    this.LoadData();
  }

  private async LoadData() {
    await this.GetAllBuildings();
    await this.GetAllRooms();
    await this.GetAllDevices();
    await this.GetAllUIConfigs();
    await this.GetAllDeviceTypes();
    await this.GetAllDeviceRoles();
    await this.GetAllTemplates();
    await this.GetAllRoomConfigurations();
    await this.GetAllRoomDesignations();
    await this.SetBuildingToRoomsMap();
    await this.SetRoomToDevicesMap();
    this.finished = true;
    this.loaded.emit(true);
  }

  private async GetAllBuildings() {
    this.allBuildings = [];

    await this.api.GetAllBuildings().then((buildings) => {
      this.allBuildings = buildings;
    })
  }

  private async GetAllRooms() {
    this.allRooms = [];
    this.buildingToRoomsMap.clear();

    await this.api.GetAllRooms().then((rooms) => {
      this.allRooms = rooms;
    });
  }

  private async GetAllDevices() {
    this.allDevices = [];
    this.roomToDevicesMap.clear();

    await this.api.GetAllDevices().then((devices) => {
      this.allDevices = devices;
    });
  }

  private async GetAllDeviceTypes() {
    this.deviceTypeList = [];
    this.deviceTypeMap.clear();

    await this.api.GetDeviceTypes().then((types) => {
      this.deviceTypeList = types;

      for(let type of this.deviceTypeList) {
        this.deviceTypeMap.set(type.id, type);
      }
    });
  }

  private async GetAllRoomConfigurations() {
    this.roomConfigurations = [];

    await this.api.GetRoomConfigurations().then((configurations) => {
      this.roomConfigurations = configurations;
    });
  }

  private async GetAllRoomDesignations() {
    this.roomDesignations = [];

    this.api.GetRoomDesignations().then((designations) => {
      this.roomDesignations = designations as string[];
    });
  }

  private async GetAllUIConfigs() {
    this.allUIConfigs = [];
    this.roomToUIConfigMap.clear();

    await this.api.GetAllUIConfigs().then((configs) => {
      this.allUIConfigs = configs;

      for(let config of this.allUIConfigs) {
        this.roomToUIConfigMap.set(config.id, config);
      }
    });
  }

  private async GetAllDeviceRoles() {
    this.deviceRoles = [];

    this.api.GetDeviceRoles().then((roles) => {
      this.deviceRoles = roles;
    });
  }

  private async GetAllTemplates() {
    this.templateList = [];

    this.api.GetTemplates().then((list) => {
      this.templateList = list;
    });
  }

  private async SetBuildingToRoomsMap() {
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

  private async SetRoomToDevicesMap() {
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

  GetBuilding(buildingID: string): Building {
    for(let building of this.allBuildings) {
      if(buildingID == building.id) {
        return building;
      }
    }
  }

  GetRoom(roomID: string): Room {
    let buildingID = roomID.split("-")[0]

    if(this.buildingToRoomsMap.get(buildingID) != null) {
      for(let room of this.buildingToRoomsMap.get(buildingID)) {
        if(roomID == room.id) {
          return room;
        }
      }
    }
  }

  GetDevice(deviceID: string): Device {
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

  DeviceHasRole(device: Device, role: string): boolean {
    for(let r of device.roles) {
      if(r.id === role) {
        return true;
      }
    }

    return false;
  }
}
