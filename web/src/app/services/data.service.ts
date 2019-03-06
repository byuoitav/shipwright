import { Injectable, EventEmitter } from '@angular/core';
import { APIService } from './api.service';
import { Building, Room, Device, UIConfig, DeviceType, Role, RoomConfiguration, Template } from '../objects/database';
import { RoomIssue } from '../objects/alerts';
import { SocketService } from './socket.service';
import { StaticDevice, RoomStatus, BuildingStatus, CombinedRoomState } from '../objects/static';
import { StringsService } from './strings.service';
import { NotifierService } from 'angular-notifier';
//import { RSA_NO_PADDING } from 'constants';

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
  roomIssuesMap: Map<string, RoomIssue[]> = new Map();
  closureCodes: string[] = [];

  staticDeviceList: StaticDevice[] = [];
  roomStatusList: RoomStatus[] = [];
  buildingStatusList: BuildingStatus[] = [];
  combinedRoomStateList: CombinedRoomState[] = [];

  loaded: EventEmitter<boolean>;
  finished: boolean = false;
  completedOperations: number = 0;
  totalCompletion: number = 100;
  increment: number = Math.ceil(this.totalCompletion / 17);

  settingsChanged: EventEmitter<any>;
  panelCount: number = 2;

  issueEmitter: EventEmitter<any>;

  notifier: NotifierService;

  constructor(public api: APIService, private socket: SocketService, private text: StringsService, notify: NotifierService) {
    this.loaded = new EventEmitter<boolean>();
    this.settingsChanged = new EventEmitter<number>();
    this.issueEmitter = new EventEmitter<any>();
    this.notifier = notify;
    this.LoadData();
    this.ListenForIssues();
  }

  private async LoadData() {
    await this.GetAllBuildings(); //          1
    this.completedOperations += this.increment;
    await this.GetAllRooms(); //              2
    this.completedOperations += this.increment;
    await this.GetAllDevices(); //            3
    this.completedOperations += this.increment;
    await this.GetAllUIConfigs(); //          4
    this.completedOperations += this.increment;
    await this.GetAllDeviceTypes(); //        5
    this.completedOperations += this.increment;
    await this.GetAllDeviceRoles(); //        6
    this.completedOperations += this.increment;
    await this.GetAllTemplates(); //          7
    this.completedOperations += this.increment;
    await this.GetAllRoomConfigurations(); // 8
    this.completedOperations += this.increment;
    await this.GetAllRoomDesignations(); //   9
    this.completedOperations += this.increment;
    await this.SetBuildingToRoomsMap(); //   10
    this.completedOperations += this.increment;
    await this.SetRoomToDevicesMap(); //     11
    this.completedOperations += this.increment;
    await this.GetIconList(); //             12
    this.completedOperations += this.increment;
    await this.GetStoredRoomIssues(); //     13
    this.completedOperations += this.increment;
    await this.GetStaticDevices(); //        14
    this.completedOperations += this.increment;
    await this.GetRoomStatusList(); //       15
    this.completedOperations += this.increment;
    await this.GetBuildingStatusList(); //   16
    this.completedOperations += this.increment;
    await this.GetClosureCodes(); //         17
    this.completedOperations += this.increment;
    await this.GetCombinedRoomState();//     18
    this.completedOperations += this.increment;
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
    })
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
      this.SetRoomIssuesMap();
    })
  }

  private SetRoomIssuesMap() {
    this.roomIssuesMap.clear();

    for(let issue of this.roomIssueList) {
      if(this.roomIssuesMap.get(issue.roomID) == null) {
        this.roomIssuesMap.set(issue.roomID, [issue]);
      } else {
        this.roomIssuesMap.get(issue.roomID).push(issue);
      }
    }
  }

  private ListenForIssues() {
    this.socket.listener.subscribe(issue => {
      console.log(issue)

      if(this.roomIssueList == null) {
        if (!issue.resolved) {
          this.roomIssueList = [issue]
        }
      } else {
        let found = false;

        let matchingIssue = 
          this.roomIssueList.find(one => one.issueID === issue.issueID)

        if(matchingIssue == null) {
          if (issue.resolved) {
            //this.notifier.notify( "warning", "New Room Issue received for " + issue.roomID + " but already resolved" );
          } else {
            this.notifier.notify( "error", "New Room Issue [" + issue.activeAlertTypes[0] + "] for " + issue.roomID );
            this.roomIssueList.push(issue);
            //this.roomIssueList = this.roomIssueList.sort(this.RoomIssueSorter)
          } 
        } else {
          //matchingIssue = issue;
          const index = this.roomIssueList.indexOf(matchingIssue, 0);          

          if (index > -1) {
            if (issue.resolved) {            
              this.notifier.notify( "success", "Room Issue for " + issue.roomID + " resolved.");            
              this.roomIssueList.splice(index, 1);
            }            
            else {
              this.roomIssueList.splice(index, 1, issue);
            }
          }          
        }
        
        this.issueEmitter.emit(issue);
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
    })
  }

  private async GetRoomStatusList() {
    this.roomStatusList = [];

    for(let sd of this.staticDeviceList) {
      let roomID = sd.deviceID.substring(0, sd.deviceID.lastIndexOf("-"))
      let added = false;

      for(let rs of this.roomStatusList) {
        if(rs.roomID == roomID) {
          rs.deviceStates.push(sd)
          rs.roomIssues = this.GetRoomIssues(rs.roomID)
          added = true
          rs.UpdateAlerts()
        }
      }
      if(!added) {

        let roomState = new RoomStatus()
        roomState.roomID = roomID
        roomState.deviceStates = [sd]
        roomState.roomIssues = this.GetRoomIssues(roomState.roomID)
        roomState.UpdateAlerts()
        this.roomStatusList.push(roomState)
      }
    }
  }

  private async GetCombinedRoomState(){
    await this.api.GetAllCombinedRoomStates().then((records) => {
      console.log("record: ",records)
      this.combinedRoomStateList = records;
      // this.GetRoomStatusList();
    })
  }

  private async GetBuildingStatusList() {
    this.buildingStatusList = [];

    for(let rs of this.roomStatusList) {
      let buildingID = rs.roomID.substring(0, rs.roomID.lastIndexOf("-"))
      let added = false;

      for(let bs of this.buildingStatusList) {
        if(bs.buildingID == buildingID) {
          bs.roomStates.push(rs)
          added = true;
        }
      }
      if(!added) {
        let buildingState = new BuildingStatus()
        buildingState.buildingID = buildingID
        buildingState.roomStates = [rs]
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

  GetRoomIssues(roomID): RoomIssue[] {    
    return this.roomIssuesMap.get(roomID);
  }

  GetRoomIssue(roomID): RoomIssue[] {    
    //i added this to get it to complie
    return null;
  }

  GetStaticDevice(deviceID: string): StaticDevice {
    for(let record of this.staticDeviceList) {
      if(record.deviceID == deviceID) {
        return record;
      }
    }
    return new StaticDevice();
  }

  GetRoomState(roomID: string): RoomStatus {
    for(let record of this.roomStatusList) {
      if(record.roomID == roomID) {
        return record;
      }
    }
    return new RoomStatus();
  }

  GetBuildingState(buildingID: string): BuildingStatus {
    for(let record of this.buildingStatusList) {
      if(record.buildingID == buildingID) {
        return record
      }
    }
    return new BuildingStatus();
  }

  GetRoomIssuesBySeverity(severity?: string): RoomIssue[] {
    let temp: RoomIssue[] = [];

    if(severity == null || severity == "all" || severity == undefined) {
      return this.roomIssueList;
    }
    else {
      for(let issue of this.roomIssueList) {
        if(issue.severity.toLowerCase() == severity.toLowerCase()) {
          temp.push(issue)
        }
      }
    }
    return temp;
  }
}
