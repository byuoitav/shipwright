import { Injectable, EventEmitter } from "@angular/core";
import { APIService } from "./api.service";
import {
  Building,
  Room,
  Device,
  UIConfig,
  DeviceType,
  Person,
  Role,
  RoomConfiguration,
  Template
} from "../objects/database";
import { RoomIssue } from "../objects/alerts";
import { SocketService } from "./socket.service";
import {
  StaticDevice,
  RoomStatus,
  BuildingStatus,
  CombinedRoomState
} from "../objects/static";
import { StringsService } from "./strings.service";
import { NotifierService } from "angular-notifier";

@Injectable({
  providedIn: "root"
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
  possibleResponders: Person[] = [];

  staticDeviceList: StaticDevice[] = [];
  roomStatusList: RoomStatus[] = [];
  buildingStatusList: BuildingStatus[] = [];
  combinedRoomStateList: CombinedRoomState[] = [];

  loaded: EventEmitter<boolean>;
  finished = false;
  completedOperations = 0;
  totalCompletion = 100;
  increment: number = Math.ceil(this.totalCompletion / 19);

  settingsChanged: EventEmitter<any>;
  panelCount = 1;

  issueEmitter: EventEmitter<any>;

  notifier: NotifierService;

  currentUsername: string;

  constructor(
    public api: APIService,
    private socket: SocketService,
    private text: StringsService,
    notify: NotifierService
  ) {
    this.loaded = new EventEmitter<boolean>();
    this.settingsChanged = new EventEmitter<number>();
    this.issueEmitter = new EventEmitter<any>();
    this.notifier = notify;
    this.LoadData();
    this.ListenForIssues();
  }

  private async LoadData() {
    await this.GetCurrentUsername(); //       1
    await this.GetAllBuildings(); //          2
    await this.GetAllRooms(); //              3
    await this.GetAllDevices(); //            4
    await this.GetAllUIConfigs(); //          5
    await this.GetAllDeviceTypes(); //        6
    await this.GetAllDeviceRoles(); //        7
    await this.GetAllTemplates(); //          8
    await this.GetAllRoomConfigurations(); // 9
    await this.GetAllRoomDesignations(); //   10
    await this.SetBuildingToRoomsMap(); //    11
    await this.SetRoomToDevicesMap(); //      12
    await this.GetIconList(); //              13
    await this.GetStoredRoomIssues(); //      14
    await this.GetStaticDevices(); //         15
    await this.GetCombinedRoomState(); //     16
    await this.GetBuildingStatusList(); //    17
    await this.GetClosureCodes(); //          18
    await this.SetPossibleResponders(); //    19
    this.finished = true;
    this.loaded.emit(true);
  }

  private async GetCurrentUsername() {
    await this.api.GetCurrentUsername().then(username => {
      this.currentUsername = username as string;
      this.completedOperations += this.increment;
    });
  }

  private async GetAllBuildings() {
    this.allBuildings = [];

    await this.api.GetAllBuildings().then(buildings => {
      this.allBuildings = buildings;
      this.completedOperations += this.increment;
    });
  }

  private async GetAllRooms() {
    this.allRooms = [];
    this.buildingToRoomsMap.clear();

    await this.api.GetAllRooms().then(rooms => {
      this.allRooms = rooms;
      this.completedOperations += this.increment;
    });
  }

  private async GetAllDevices() {
    this.allDevices = [];
    this.roomToDevicesMap.clear();

    await this.api.GetAllDevices().then(devices => {
      this.allDevices = devices;
      this.completedOperations += this.increment;
    });
  }

  private async GetAllDeviceTypes() {
    this.deviceTypeList = [];
    this.deviceTypeMap.clear();

    await this.api.GetDeviceTypes().then(types => {
      this.deviceTypeList = types;

      for (const type of this.deviceTypeList) {
        this.deviceTypeMap.set(type.id, type);
      }
      this.completedOperations += this.increment;
    });
  }

  private async GetAllRoomConfigurations() {
    this.roomConfigurations = [];

    await this.api.GetRoomConfigurations().then(configurations => {
      this.roomConfigurations = configurations;
      this.completedOperations += this.increment;
    });
  }

  private async GetAllRoomDesignations() {
    this.roomDesignations = [];

    this.api.GetRoomDesignations().then(designations => {
      this.roomDesignations = designations as string[];
      this.completedOperations += this.increment;
    });
  }

  private async GetAllUIConfigs() {
    this.allUIConfigs = [];
    this.roomToUIConfigMap.clear();

    await this.api.GetAllUIConfigs().then(configs => {
      this.allUIConfigs = configs;

      for (const config of this.allUIConfigs) {
        this.roomToUIConfigMap.set(config.id, config);
      }
      this.completedOperations += this.increment;
    });
  }

  private async GetAllDeviceRoles() {
    this.deviceRoles = [];

    this.api.GetDeviceRoles().then(roles => {
      this.deviceRoles = roles;
      this.completedOperations += this.increment;
    });
  }

  private async GetAllTemplates() {
    this.templateList = [];

    this.api.GetTemplates().then(list => {
      this.templateList = list;
      this.completedOperations += this.increment;
    });
  }

  private async GetIconList() {
    this.iconList = [];

    this.api.GetIcons().then(icons => {
      this.iconList = icons as string[];
      this.completedOperations += this.increment;
    });
  }

  private async SetBuildingToRoomsMap() {
    for (const room of this.allRooms) {
      for (const building of this.allBuildings) {
        const buildingPart = room.id.split("-")[0];
        if (buildingPart === building.id) {
          if (this.buildingToRoomsMap.get(building.id) == null) {
            this.buildingToRoomsMap.set(building.id, [room]);
          } else {
            this.buildingToRoomsMap.get(building.id).push(room);
          }
          break;
        }
      }
    }
    this.completedOperations += this.increment;
  }

  private async SetRoomToDevicesMap() {
    for (const device of this.allDevices) {
      for (const room of this.allRooms) {
        const roomPart = device.id.substring(0, device.id.lastIndexOf("-"));
        if (roomPart === room.id) {
          if (this.roomToDevicesMap.get(room.id) == null) {
            this.roomToDevicesMap.set(room.id, [device]);
          } else {
            this.roomToDevicesMap.get(room.id).push(device);
          }
          break;
        }
      }
    }
    this.completedOperations += this.increment;
  }

  private async GetStoredRoomIssues() {
    await this.api.GetAllIssues().then(issues => {
      this.roomIssueList = issues;
      this.SetRoomIssuesMap();
      this.completedOperations += this.increment;
    });
  }

  private SetRoomIssuesMap() {
    this.roomIssuesMap.clear();

    for (const issue of this.roomIssueList) {
      if (this.roomIssuesMap.get(issue.roomID) == null) {
        this.roomIssuesMap.set(issue.roomID, [issue]);
      } else {
        this.roomIssuesMap.get(issue.roomID).push(issue);
      }
    }
  }

  private ListenForIssues() {
    this.socket.listener.subscribe(issue => {
      if (this.roomIssueList == null) {
        if (!issue.resolved) {
          this.roomIssueList = [issue];
        }
      } else {
        const found = false;

        const matchingIssue = this.roomIssueList.find(
          one => one.issueID === issue.issueID
        );

        if (matchingIssue == null) {
          if (issue.resolved) {
            // this.notifier.notify( "warning", "New Room Issue received for " + issue.roomID + " but already resolved" );
          } else {
            this.notifier.notify(
              "error",
              "New Room Issue [" +
                issue.activeAlertTypes[0] +
                "] for " +
                issue.roomID
            );
            this.roomIssueList.push(issue);
            // this.roomIssueList = this.roomIssueList.sort(this.RoomIssueSorter)
          }
        } else {
          // matchingIssue = issue;
          const index = this.roomIssueList.indexOf(matchingIssue);

          if (index > -1) {
            if (issue.resolved) {
              this.notifier.notify(
                "success",
                "Room Issue for " + issue.roomID + " resolved."
              );
              this.roomIssueList.splice(index, 1);
            } else {
              this.roomIssueList.splice(index, 1, issue);
            }
          }
        }

        this.issueEmitter.emit(issue);
      }
    });
  }

  private async GetClosureCodes() {
    this.closureCodes = [];

    await this.api.GetClosureCodes().then(codes => {
      this.closureCodes = codes as string[];
      this.completedOperations += this.increment;
    });
  }

  private async GetStaticDevices() {
    await this.api.GetAllStaticDeviceRecords().then(records => {
      this.staticDeviceList = records;
      this.completedOperations += this.increment;
    });
  }

  private async GetCombinedRoomState() {
    await this.api.GetAllCombinedRoomStates().then(records => {
      this.combinedRoomStateList = records;
      this.completedOperations += this.increment;
    });
  }

  private async GetBuildingStatusList() {
    this.buildingStatusList = [];

    for (const rs of this.combinedRoomStateList) {
      const buildingID = rs.roomID.substring(0, rs.roomID.lastIndexOf("-"));
      let added = false;

      for (const bs of this.buildingStatusList) {
        if (bs.buildingID === buildingID) {
          bs.roomStates.push(rs);
          added = true;
        }
      }
      if (!added) {
        const buildingState = new BuildingStatus();
        buildingState.buildingID = buildingID;
        buildingState.roomStates = [rs];
        this.buildingStatusList.push(buildingState);
      }
    }
    this.completedOperations += this.increment;
  }

  GetBuilding(buildingID: string): Building {
    for (const building of this.allBuildings) {
      if (buildingID === building.id) {
        return building;
      }
    }
  }

  GetRoom(roomID: string): Room {
    const buildingID = roomID.split("-")[0];

    if (this.buildingToRoomsMap.get(buildingID) != null) {
      for (const room of this.buildingToRoomsMap.get(buildingID)) {
        if (roomID === room.id) {
          return room;
        }
      }
    }
  }

  GetDevice(deviceID: string): Device {
    const deviceSplit = deviceID.split("-");
    const roomID = deviceSplit[0] + "-" + deviceSplit[1];

    if (this.roomToDevicesMap.get(roomID) != null) {
      for (const device of this.roomToDevicesMap.get(roomID)) {
        if (deviceID === device.id) {
          return device;
        }
      }
    }
  }

  DeviceHasRole(device: Device, role: string): boolean {
    for (const r of device.roles) {
      if (r.id === role) {
        return true;
      }
    }

    return false;
  }

  GetRoomIssues(roomID): RoomIssue[] {
    return this.roomIssuesMap.get(roomID);
  }

  GetRoomIssue(roomID): RoomIssue {
    return this.roomIssuesMap.get(roomID)[0];
  }

  GetStaticDevice(deviceID: string): StaticDevice {
    for (const record of this.staticDeviceList) {
      if (record.deviceID === deviceID) {
        return record;
      }
    }
    return new StaticDevice();
  }

  GetRoomState(roomID: string): CombinedRoomState {
    for (const record of this.combinedRoomStateList) {
      if (record.roomID === roomID) {
        return record;
      }
    }
  }

  GetBuildingState(buildingID: string): BuildingStatus {
    for (const record of this.buildingStatusList) {
      if (record.buildingID === buildingID) {
        return record;
      }
    }
    return new BuildingStatus();
  }

  GetRoomIssuesBySeverity(severity?: string): RoomIssue[] {
    const temp: RoomIssue[] = [];

    if (severity == null || severity === "all" || severity === undefined) {
      return this.roomIssueList;
    } else {
      for (const issue of this.roomIssueList) {
        // exclude development rooms
        if (issue.roomTags.includes("development") || issue.roomTags.includes("testing")) {
          continue;
        }

        for (const issueSev of issue.activeAlertSeverities) {
          if (issueSev.toLowerCase() === severity.toLowerCase()) {
            temp.push(issue);
          }
        }
      }
    }
    return temp;
  }

  async SetPossibleResponders() {
    await this.api.GetPossibleResponders().then(response => {
      this.possibleResponders = response;
      this.completedOperations += this.increment;
    });
  }
}
