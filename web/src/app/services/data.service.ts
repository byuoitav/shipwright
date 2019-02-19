import { Injectable, EventEmitter } from '@angular/core';
import { APIService } from './api.service';
import { Building, Room, Device, UIConfig, DeviceType, Role, RoomConfiguration, Template } from '../objects/database';
import { RoomIssue } from '../objects/alerts';
import { SocketService } from './socket.service';
import { StaticDevice, RoomStatus, BuildingStatus } from '../objects/static';

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
  iconList: string[] = [];

  buildingToRoomsMap: Map<string, Room[]> = new Map();
  roomToDevicesMap: Map<string, Device[]> = new Map();
  roomToUIConfigMap: Map<string, UIConfig> = new Map();

  roomIssueList: RoomIssue[] = [];
  closureCodes: string[] = [];

  staticDeviceList: StaticDevice[] = [];
  roomStatusList: RoomStatus[] = [];
  buildingStatusList: BuildingStatus[] = [];

  loaded: EventEmitter<boolean>;
  finished: boolean = false;

  settingsChanged: EventEmitter<any>;
  panelCount: number = 1;

  issueEmitter: EventEmitter<any>;

  constructor(public api: APIService, private socket: SocketService) {
    this.loaded = new EventEmitter<boolean>();
    this.settingsChanged = new EventEmitter<number>();
    this.issueEmitter = new EventEmitter<any>();
    this.LoadData();
    this.ListenForIssues();
  }

  private async LoadData() {
    /*Promise.all([
      await this.GetStaticDevices(),
      await this.GetAllBuildings(),
    await this.GetAllRooms(),
    await this.GetAllDevices(),
    await this.GetAllUIConfigs(),
    await this.GetAllDeviceTypes(),
    await this.GetAllDeviceRoles(),
    await this.GetAllTemplates(),
    await this.GetAllRoomConfigurations(),
    await this.GetAllRoomDesignations(),
    await this.SetBuildingToRoomsMap(),
    await this.SetRoomToDevicesMap(),
    await this.GetIconList(),
    await this.GetStoredRoomIssues(),
    await this.GetRoomStatusList(),
    await this.GetBuildingStatusList(),
    await this.GetClosureCodes()
    ]).finally(() => {
      this.finished = true;
      this.loaded.emit(true);
      console.log("done");
    })
     */
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
     await this.GetIconList();
     await this.GetStoredRoomIssues();
     await this.GetStaticDevices();
     await this.GetRoomStatusList();
    //  await this.GetBuildingStatusList();
     await this.GetClosureCodes();
     this.finished = true;
     this.loaded.emit(true);
     console.log("done");
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

  private async GetIconList() {
    this.iconList = [];

    this.api.GetIcons().then((icons) => {
      this.iconList = icons as string[]
    })
  }

  private async SetBuildingToRoomsMap() {
    for(let room of this.allRooms) {
      for(let building of this.allBuildings) {
        let buildingPart = room.id.split("-")[0]
        if(buildingPart === building.id) {
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
        let roomPart = device.id.substring(0, device.id.lastIndexOf("-"))
        if(roomPart === room.id) {
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

  private async GetStoredRoomIssues() {    
    await this.api.GetAllIssues().then((issues) => {
      this.roomIssueList = issues
    })
  }

  private ListenForIssues() {
    this.socket.listener.subscribe(issue => {
      if(this.roomIssueList == null) {
        this.roomIssueList = [issue]
      } else {
        let found = false;
        for(let i of this.roomIssueList) {
          if(i.issueID == issue.issueID) {
            i = issue;
            found = true;
          }
        }
        if(!found) {
          this.roomIssueList.push(issue);
          this.roomIssueList = this.roomIssueList.sort(this.RoomIssueSorter)
        }
        this.issueEmitter.emit();
      }
    })
  }

  private RoomIssueSorter(a, b): number {
    if(a.roomID == null && b.roomID != null) {return 1}
    if(b.roomID == null && a.roomID != null) {return -1}
    return a!.roomID!.localeCompare(b.roomID);
  }

  private async GetClosureCodes() {
    this.closureCodes = [];

    this.api.GetClosureCodes().then((codes) => {
      this.closureCodes = codes as string[]
    })
  }

  private async GetStaticDevices() { 
    await this.api.GetAllStaticDeviceRecords().then((records) => {
      this.staticDeviceList = records;
      // this.GetRoomStatusList();
      console.log("found devices")
    })
  }

  private async GetRoomStatusList() {
    console.log("hello")
    this.roomStatusList = [];

    for(let sd of this.staticDeviceList) {
      let roomID = sd.deviceID.substring(0, sd.deviceID.lastIndexOf("-"))
      let added = false;

      for(let rs of this.roomStatusList) {
        if(rs.roomID == roomID) {
          rs.deviceStates.push(sd)
          rs.Update()
          added = true
        }
      }
      if(!added) {
        
        let roomState = new RoomStatus()
        roomState.roomID = roomID
        roomState.deviceStates = [sd]
        roomState.Update()
        this.roomStatusList.push(roomState)
      }
    }
    console.log("I am done")
    this.GetBuildingStatusList()
  }

  private async GetBuildingStatusList() {
    console.log("building list starting")
    this.buildingStatusList = [];

    for(let rs of this.roomStatusList) {
      let buildingID = rs.roomID.substring(0, rs.roomID.lastIndexOf("-"))
      let added = false;

      for(let bs of this.buildingStatusList) {
        if(bs.buildingID = buildingID) {
          bs.roomStates.push(rs)
          bs.Update()
          added = true;
        }
      }
      if(!added) {
        console.log("derek")
        console.log(buildingID);
        let buildingState = new BuildingStatus()
        buildingState.buildingID = buildingID
        buildingState.roomStates = [rs]
        buildingState.Update()
        this.buildingStatusList.push(buildingState)
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

  GetRoomIssue(roomID): RoomIssue {
    for(let issue of this.roomIssueList) {
      if(issue.roomID == roomID) {
        return issue;
      }
    }
  }

  GetStaticDevice(deviceID: string): StaticDevice {
    for(let record of this.staticDeviceList) {
      if(record.deviceID == deviceID) {
        return record
      }
    }
  }

  GetRoomState(roomID: string): RoomStatus {
    for(let record of this.roomStatusList) {
      if(record.roomID == roomID) {
        return record
      }
    }
  }

  GetBuildingState(buildingID: string): BuildingStatus {
    for(let record of this.buildingStatusList) {
      if(record.buildingID == buildingID) {
        return record
      }
    }
  }

  GetRoomIssues(severity?: string): RoomIssue[] {
    // let temp: RoomIssue[] = [];

    // for(let issue of this.roomIssueList) {
    //   if(severity != null) {
    //     if(issue.severity == severity) {
    //       temp.push(issue);
    //     }
    //   } else {
    //     temp.push(issue);
    //   }
    // }
    // return temp;
    return this.roomIssueList
  }
}
