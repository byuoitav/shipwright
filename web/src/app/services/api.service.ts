import { Injectable, EventEmitter } from "@angular/core";
import { JsonConvert, Any } from "json2typescript";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
  Building,
  DBResponse,
  Room,
  RoomConfiguration,
  Device,
  DeviceType,
  Person,
  Role,
  UIConfig,
  Template,
  MenuTree
} from "../objects/database";
import { StaticDevice, CombinedRoomState, StaticRoom } from "../objects/static";
import {
  RoomIssue,
  Alert,
  ResolutionInfo,
  ClassHalfHourBlock
} from "../objects/alerts";
import { CookieService } from "ngx-cookie-service";
import { BehaviorSubject, Observable, throwError } from "rxjs";

export class IssueRef {
  private _issues: BehaviorSubject<RoomIssue[]>;
  private _done: () => void;

  get issues() {
    if (this._issues) {
      return this._issues.value;
    }

    return undefined;
  }

  get subject() {
    return this._issues;
  }

  constructor(issues: BehaviorSubject<RoomIssue[]>, _done: () => void) {
    this._issues = issues;
  }

  done = () => {
    if (this._done) {
      return this._done();
    }

    return;
  };
}

@Injectable({
  providedIn: "root"
})
export class APIService {
  public theme = "default";
  public themeSwitched: EventEmitter<string[]>;

  private converter: JsonConvert;
  private urlParams: URLSearchParams;

  private headers: HttpHeaders;

  constructor(public cookies: CookieService, private http: HttpClient) {
    this.themeSwitched = new EventEmitter<string[]>();
    this.converter = new JsonConvert();
    this.converter.ignorePrimitiveChecks = false;

    this.urlParams = new URLSearchParams(window.location.search);
    if (this.urlParams.has("theme")) {
      this.theme = this.urlParams.get("theme");
    }

    this.headers = new HttpHeaders({
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    });
  }

  public refresh() {
    window.location.reload();
  }

  public switchTheme(name: string) {
    const oldTheme = this.theme + "-theme";
    const newTheme = name + "-theme";

    this.theme = name;
    this.cookies.set("theme", name, 365);

    this.themeSwitched.emit([oldTheme, newTheme]);

    window.history.replaceState(null, "SMEE", window.location.pathname);
  }

  // Building Functions
  public async AddBuilding(toAdd: Building) {
    try {
      const data: any = await this.http
        .post("buildings/" + toAdd.id, this.converter.serialize(toAdd), {
          headers: this.headers
        })
        .toPromise();
      const response = this.converter.deserializeObject(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error adding the building " + toAdd.id + ": " + e);
    }
  }

  public async AddBuildings(toAdd: Building[]) {
    try {
      const data: any = await this.http.post(
        "buildings",
        this.converter.serialize(toAdd),
        { headers: this.headers }
      );
      const response = this.converter.deserializeArray(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error adding multiple buildings: " + e);
    }
  }

  public async GetBuilding(buildingID: string) {
    try {
      const data: any = await this.http
        .get("buildings/" + buildingID, { headers: this.headers })
        .toPromise();
      const building = this.converter.deserializeObject(data, Building);

      return building;
    } catch (e) {
      throw new Error("error getting the building " + buildingID + ": " + e);
    }
  }

  public async GetAllBuildings() {
    try {
      const data: any = await this.http
        .get("buildings", { headers: this.headers })
        .toPromise();
      const buildings = this.converter.deserializeArray(data, Building);
      // let bArray: Building[] = [];
      // this.converter.deserializeArray(data, Building)

      return buildings;
    } catch (e) {
      throw new Error("error getting all buildings: " + e);
    }
  }

  public async UpdateBuilding(idToUpdate: string, toUpdate: Building) {
    try {
      console.log(idToUpdate);
      console.log(toUpdate);
      const data: any = await this.http
        .put(
          "buildings/" + idToUpdate + "/update",
          this.converter.serialize(toUpdate),
          { headers: this.headers }
        )
        .toPromise();
      const response = this.converter.deserializeObject(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error updating the building " + idToUpdate + ": " + e);
    }
  }

  public async UpdateBuildings(toUpdate: Building[]) {
    try {
      const data: any = await this.http
        .put("buildings/update", this.converter.serialize(toUpdate), {
          headers: this.headers
        })
        .toPromise();
      const response = this.converter.deserializeArray(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error updating multiple buildings: " + e);
    }
  }

  public async DeleteBuilding(buildingID: string) {
    try {
      const data: any = await this.http
        .get("buildings/" + buildingID + "/delete", { headers: this.headers })
        .toPromise();
      const response = this.converter.deserializeObject(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error deleting the building " + buildingID + ": " + e);
    }
  }

  // Room Functions
  public async AddRoom(toAdd: Room) {
    try {
      const data: any = await this.http
        .post("rooms/" + toAdd.id, this.converter.serialize(toAdd), {
          headers: this.headers
        })
        .toPromise();
      const response = this.converter.deserializeObject(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error adding the room " + toAdd.id + ": " + e);
    }
  }

  public async AddRooms(toAdd: Room[]) {
    try {
      const data: any = await this.http.post(
        "rooms",
        this.converter.serialize(toAdd),
        { headers: this.headers }
      );
      const response = this.converter.deserializeArray(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error adding multiple rooms: " + e);
    }
  }

  public async GetRoom(roomID: string) {
    try {
      const data: any = await this.http
        .get("rooms/" + roomID, { headers: this.headers })
        .toPromise();
      const room = this.converter.deserializeObject(data, Room);

      return room;
    } catch (e) {
      throw new Error("error getting the room " + roomID + ": " + e);
    }
  }

  public async GetAllRooms() {
    try {
      const data: any = await this.http
        .get("rooms", { headers: this.headers })
        .toPromise();
      const rooms = this.converter.deserializeArray(data, Room);

      return rooms;
    } catch (e) {
      throw new Error("error getting all rooms: " + e);
    }
  }

  public async GetRoomsByBuilding(buildingID: string) {
    try {
      const data: any = await this.http
        .get("buildings/" + buildingID + "/rooms", { headers: this.headers })
        .toPromise();
      const rooms = this.converter.deserializeArray(data, Room);

      return rooms;
    } catch (e) {
      throw new Error(
        "error getting all rooms in the building " + buildingID + ": " + e
      );
    }
  }

  public async UpdateRoom(idToUpdate: string, toUpdate: Room) {
    try {
      const data: any = await this.http
        .put(
          "rooms/" + idToUpdate + "/update",
          this.converter.serialize(toUpdate),
          { headers: this.headers }
        )
        .toPromise();
      const response = this.converter.deserializeObject(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error updating the room " + idToUpdate + ": " + e);
    }
  }

  public async UpdateRooms(toUpdate: Room[]) {
    try {
      const data: any = await this.http
        .put("rooms/update", this.converter.serialize(toUpdate), {
          headers: this.headers
        })
        .toPromise();
      const response = this.converter.deserializeArray(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error updating multiple rooms: " + e);
    }
  }

  public async DeleteRoom(roomID: string) {
    try {
      const data: any = await this.http
        .get("rooms/" + roomID + "/delete", { headers: this.headers })
        .toPromise();
      const response = this.converter.deserializeObject(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error deleting the room " + roomID + ": " + e);
    }
  }

  public async GetRoomConfigurations() {
    try {
      const data: any = await this.http
        .get("rooms/configurations", { headers: this.headers })
        .toPromise();
      const roomConfigs = this.converter.deserializeArray(
        data,
        RoomConfiguration
      );

      return roomConfigs;
    } catch (e) {
      throw new Error("error getting all room configurations: " + e);
    }
  }

  public async GetRoomDesignations() {
    try {
      const data: any = await this.http
        .get("rooms/designations", { headers: this.headers })
        .toPromise();

      return data;
    } catch (e) {
      throw new Error("error getting all room designations: " + e);
    }
  }

  // Device Functions
  public async AddDevice(toAdd: Device) {
    try {
      const data: any = await this.http
        .post("devices/" + toAdd.id, this.converter.serialize(toAdd), {
          headers: this.headers
        })
        .toPromise();
      const response = this.converter.deserializeObject(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error adding the device " + toAdd.id + ": " + e);
    }
  }

  public async AddDevices(toAdd: Device[]) {
    try {
      const data: any = await this.http.post(
        "devices",
        this.converter.serialize(toAdd),
        { headers: this.headers }
      );
      const response = this.converter.deserializeArray(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error adding multiple devices: " + e);
    }
  }

  public async GetDevice(deviceID: string) {
    try {
      const data: any = await this.http
        .get("devices/" + deviceID, { headers: this.headers })
        .toPromise();
      const device = this.converter.deserializeObject(data, Device);

      return device;
    } catch (e) {
      throw new Error("error getting the device " + deviceID + ": " + e);
    }
  }

  public async GetAllDevices() {
    try {
      const data: any = await this.http
        .get("devices", { headers: this.headers })
        .toPromise();
      const devices = this.converter.deserializeArray(data, Device);

      return devices;
    } catch (e) {
      throw new Error("error getting all devices: " + e);
    }
  }

  public async GetDevicesByRoom(roomID: string) {
    try {
      const data: any = await this.http
        .get("rooms/" + roomID + "/devices", { headers: this.headers })
        .toPromise();
      const devices = this.converter.deserializeArray(data, Device);

      return devices;
    } catch (e) {
      throw new Error(
        "error getting all devices in the room " + roomID + ": " + e
      );
    }
  }

  public async GetDevicesByRoomAndRole(roomID: string, roleID: string) {
    try {
      const data: any = await this.http
        .get("rooms/" + roomID + "/devices/roles/" + roleID, {
          headers: this.headers
        })
        .toPromise();
      const devices = this.converter.deserializeArray(data, Device);

      return devices;
    } catch (e) {
      throw new Error(
        "error getting all devices in the room " +
          roomID +
          " that have the role " +
          roleID +
          ": " +
          e
      );
    }
  }

  public async GetDevicesByTypeAndRole(typeID: string, roleID: string) {
    try {
      const data: any = await this.http
        .get("devices/types/" + typeID + "/roles/" + roleID, {
          headers: this.headers
        })
        .toPromise();
      const devices = this.converter.deserializeArray(data, Device);

      return devices;
    } catch (e) {
      throw new Error(
        "error getting all devices of the type " +
          typeID +
          " that have the role " +
          roleID +
          ": " +
          e
      );
    }
  }

  public async UpdateDevice(idToUpdate: string, toUpdate: Device) {
    try {
      const data: any = await this.http
        .put(
          "devices/" + idToUpdate + "/update",
          this.converter.serialize(toUpdate),
          { headers: this.headers }
        )
        .toPromise();
      const response = this.converter.deserializeObject(data, DBResponse);

      return response;
    } catch (e) {
      throw e;
    }
  }

  public async UpdateDevices(toUpdate: Device[]) {
    try {
      const data: any = await this.http
        .put("devices/update", this.converter.serialize(toUpdate), {
          headers: this.headers
        })
        .toPromise();
      const response = this.converter.deserializeArray(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error updating multiple devices: " + e);
    }
  }

  public async DeleteDevice(deviceID: string) {
    try {
      const data: any = await this.http
        .get("devices/" + deviceID + "/delete", { headers: this.headers })
        .toPromise();
      const response = this.converter.deserializeObject(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error deleting the device " + deviceID + ": " + e);
    }
  }

  public async GetDeviceRawIPAddress(hostname: string) {
    try {
      const data: any = await this.http
        .get("devices/" + hostname + "/address", { headers: this.headers })
        .toPromise();

      return data;
    } catch (e) {
      throw new Error("error getting the IP address from the hostname: " + e);
    }
  }

  public async GetDeviceTypes() {
    try {
      const data: any = await this.http
        .get("devices/types", { headers: this.headers })
        .toPromise();
      const deviceTypes = this.converter.deserializeArray(data, DeviceType);

      return deviceTypes;
    } catch (e) {
      throw new Error("error getting all device types: " + e);
    }
  }

  public async GetDeviceRoles() {
    try {
      const data: any = await this.http
        .get("devices/roles", { headers: this.headers })
        .toPromise();
      const deviceRoles = this.converter.deserializeArray(data, Role);

      return deviceRoles;
    } catch (e) {
      throw new Error("error getting all device roles: " + e);
    }
  }

  // UIConfig Functions
  public async AddUIConfig(toAdd: UIConfig) {
    try {
      const data: any = await this.http
        .post("uiconfigs/" + toAdd.id, this.converter.serialize(toAdd), {
          headers: this.headers
        })
        .toPromise();
      const response = this.converter.deserializeObject(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error adding the uiconfig " + toAdd.id + ": " + e);
    }
  }

  public async AddUIConfigs(toAdd: UIConfig[]) {
    try {
      const data: any = await this.http.post(
        "uiconfigs",
        this.converter.serialize(toAdd),
        { headers: this.headers }
      );
      const response = this.converter.deserializeArray(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error adding multiple uiconfigs: " + e);
    }
  }

  public async GetUIConfig(configID: string) {
    try {
      const data: any = await this.http
        .get("uiconfigs/" + configID, { headers: this.headers })
        .toPromise();
      const uiconfig = this.converter.deserializeObject(data, UIConfig);

      return uiconfig;
    } catch (e) {
      throw new Error("error getting the uiconfig " + configID + ": " + e);
    }
  }

  public async GetAllUIConfigs() {
    try {
      const data: any = await this.http
        .get("uiconfigs", { headers: this.headers })
        .toPromise();
      const uiconfigs = this.converter.deserializeArray(data, UIConfig);

      return uiconfigs;
    } catch (e) {
      throw new Error("error getting all uiconfigs: " + e);
    }
  }

  public async UpdateUIConfig(idToUpdate: string, toUpdate: UIConfig) {
    try {
      const data: any = await this.http
        .put(
          "uiconfigs/" + idToUpdate + "/update",
          this.converter.serialize(toUpdate),
          { headers: this.headers }
        )
        .toPromise();
      const response = this.converter.deserializeObject(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error updating the uiconfig " + idToUpdate + ": " + e);
    }
  }

  public async UpdateUIConfigs(toUpdate: UIConfig[]) {
    try {
      const data: any = await this.http
        .put("uiconfigs/update", this.converter.serialize(toUpdate), {
          headers: this.headers
        })
        .toPromise();
      const response = this.converter.deserializeArray(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error updating multiple uiconfigs: " + e);
    }
  }

  public async DeleteUIConfig(configID: string) {
    try {
      const data: any = await this.http
        .get("uiconfigs/" + configID + "/delete", { headers: this.headers })
        .toPromise();
      const response = this.converter.deserializeObject(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error deleting the uiconfig " + configID + ": " + e);
    }
  }

  // Options Functions
  public async GetIcons() {
    try {
      const data: any = await this.http
        .get("options/icons", { headers: this.headers })
        .toPromise();

      return data;
    } catch (e) {
      throw new Error("error getting the list of icons: " + e);
    }
  }

  public async GetTemplates() {
    try {
      const data: any = await this.http
        .get("options/templates", { headers: this.headers })
        .toPromise();
      const templates = this.converter.deserializeArray(data, Template);

      return templates;
    } catch (e) {
      throw new Error("error getting the list of templates: " + e);
    }
  }

  // Authentication Functions
  public async GetCurrentUsername() {
    try {
      const data: any = await this.http
        .get("users/current/username", { headers: this.headers })
        .toPromise();

      return data;
    } catch (e) {
      throw new Error("error getting the current user's username: " + e);
    }
  }

  public async GetUserPermissions() {
    try {
      const data: any = await this.http
        .get("users/current/permissions", { headers: this.headers })
        .toPromise();
      const permissions = this.converter.deserializeArray(data, Any);

      return permissions;
    } catch (e) {
      throw new Error("error getting the current user's permissions: " + e);
    }
  }

  // Static Record Functions
  public async GetAllStaticDeviceRecords() {
    try {
      const data: any = await this.http
        .get("static/devices", { headers: this.headers })
        .toPromise();
      const records: StaticDevice[] = [];
      for (const sd of data) {
        const rec = this.converter.deserializeObject(sd, StaticDevice);

        rec.updateTimes = sd["field-state-received"];

        records.push(rec);
      }

      return records;
    } catch (e) {
      throw new Error("error getting the static device records: " + e);
    }
  }

  // Combined room Functions
  public async GetAllCombinedRoomStates() {
    try {
      const data: any = await this.http
        .get("static/rooms/state", { headers: this.headers })
        .toPromise();
      const records: CombinedRoomState[] = [];
      for (const sd of data) {
        const rec = this.converter.deserializeObject(sd, CombinedRoomState);
        records.push(rec);
      }
      return records;
    } catch (e) {
      throw new Error("error getting the Combined Room State records: " + e);
    }
  }

  public async GetAllStaticRooms() {
    try {
      const data: any = await this.http
        .get("static/rooms/state", { headers: this.headers })
        .toPromise();
      const records: StaticDevice[] = [];
      for (const sd of data) {
        const rec = this.converter.deserializeObject(sd, StaticDevice);

        rec.updateTimes = sd["field-state-received"];

        records.push(rec);
      }

      return records;
    } catch (e) {
      throw new Error("error getting the static device records: " + e);
    }
  }

  // Alert Functions
  public async GetAllIssues() {
    try {
      const data: any = await this.http
        .get("issues/", { headers: this.headers })
        .toPromise();
      const alerts = this.converter.deserializeArray(data, RoomIssue);

      return alerts;
    } catch (e) {
      throw new Error("error getting all issues: " + e);
    }
  }

  public async GetRoomIssue(roomID: string) {
    try {
      const data = await this.http
        .get("issues/" + roomID, {
          headers: this.headers
        })
        .toPromise();

      const issue = this.converter.deserialize(data, RoomIssue);
      return issue;
    } catch (e) {
      console.warn("error trying to get the issue for " + roomID + ": " + e);
    }
  }

  public async ResolveIssue(id: string, info: ResolutionInfo) {
    try {
      const data = await this.http
        .put("issues/" + id + "/resolve", this.converter.serialize(info), {
          headers: this.headers,
          responseType: "text"
        })
        .toPromise();

      return data;
    } catch (e) {
      if (e.status === 200) {
        return e.error.text;
      }

      throw new Error("error trying to resolve an issue: " + e);
    }
  }

  public async GetClosureCodes() {
    try {
      const data: any = await this.http
        .get("issues/resolutions", { headers: this.headers })
        .toPromise();

      return data;
    } catch (e) {
      throw new Error("error trying to get the closure codes: " + e);
    }
  }

  public async UpdateIssue(issue: RoomIssue) {
    try {
      const b = this.converter.serialize(issue);

      const data: any = await this.http
        .put("issues", this.converter.serialize(issue), {
          headers: this.headers,
          responseType: "text"
        })
        .toPromise();

      return data;
    } catch (e) {
      if (e.status === 200) {
        return e.error.text;
      }

      throw new Error("error trying to update an issue: " + e);
    }
  }

  public async AddAlert(alert: Alert) {
    try {
      const data: any = await this.http
        .put("alerts/add", this.converter.serialize(alert), {
          headers: this.headers
        })
        .toPromise();

      return data;
    } catch (e) {
      throw new Error("error trying to add an alert: " + e);
    }
  }

  public async GetPossibleResponders() {
    try {
      const data: any = await this.http
        .get("alerts/responders", { headers: this.headers })
        .toPromise();

      const responders = this.converter.deserializeArray(data, Person);
      return responders;
    } catch (e) {
      throw new Error("error trying to get possible responders: " + e);
    }
  }

  public async GetClassSchedule(roomID: string) {
    try {
      const data: any = await this.http
        .get("rooms/" + roomID + "/schedule", { headers: this.headers })
        .toPromise();

      const schedule = this.converter.deserializeArray(
        data,
        ClassHalfHourBlock
      );
      return schedule;
    } catch (e) {
      throw new Error(
        "error trying to get the schedule for " + roomID + ": " + e
      );
    }
  }

  public async SetMaintenanceMode(id: string, info: StaticRoom) {
    try {
      const data = await this.http
        .put("rooms/" + id + "/maintenance", this.converter.serialize(info), {
          headers: this.headers,
          responseType: "text"
        })
        .toPromise();

      return data;
    } catch (e) {
      if (e.status === 200) {
        console.log(e.error.text);
        return e.error.text;
      }

      throw new Error("error trying to set room to maintenance mode: " + e);
    }
  }

  public async GetMenuTree() {
    try {
      const data = await this.http
        .get("options/menutree", { headers: this.headers })
        .toPromise();

      console.log(data);
      const tree = this.converter.deserializeObject(data, MenuTree);

      return tree;
    } catch (e) {
      if (e.status === 200) {
        console.log(e.error.text);
        return e.error.text;
      }

      throw new Error("error trying to get the attribute presets: " + e);
    }
  }

  getIssues = async (): Promise<IssueRef> => {
    try {
      const data: any = await this.http
        .get("issues/", { headers: this.headers })
        .toPromise();
      const issues: RoomIssue[] = this.converter.deserializeArray(
        data,
        RoomIssue
      );
      const subject = new BehaviorSubject<RoomIssue[]>(issues);

      const endpoint = "wss://" + window.location.host + "/ws/";
      const ws = new WebSocket(endpoint);

      const ref = new IssueRef(subject, () => {
        console.log("closing websocket");

        ws.close();
        subject.complete();
      });

      ws.onmessage = event => {
        const parsed = JSON.parse(event.data);
        if (parsed["id"]) {
          const issue = this.converter.deserializeObject(parsed, RoomIssue);

          const idx = issues.findIndex(i => i.issueID === issue.issueID);
          if (idx < 0) {
            // new issue
            issues.push(issue);
          } else if (issue.resolved) {
            // this issue has been deleted
            issues.splice(idx, 1);
          } else {
            // this issue has been updated
            issues[idx] = issue;
          }

          subject.next(issues);
        }
      };

      ws.onerror = event => {
        console.error("websocket error", event);
        subject.error("websocket error " + event);

        alert(
          "something went wrong with the websocket. click ok to refresh the page"
        );
        window.location.reload();
      };

      return ref;
    } catch (e) {
      throw new Error("unable to get all issues " + e);
    }
  };
}
