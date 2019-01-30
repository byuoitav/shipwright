import { Injectable } from '@angular/core';
import { JsonConvert, Any } from 'json2typescript';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Building, DBResponse, Room, RoomConfiguration, Device, DeviceType, Role, UIConfig, BuildingStatus, RoomStatus, Template, MetricsResponse } from '../objects';

@Injectable({
  providedIn: 'root'
})
export class APIService {
  public theme = "default";

  private converter: JsonConvert;
  private urlParams: URLSearchParams;

  private headers: HttpHeaders;

  constructor(private http: HttpClient) {
    this.converter = new JsonConvert();
    this.converter.ignorePrimitiveChecks = false;

    this.urlParams = new URLSearchParams(window.location.search);
    if (this.urlParams.has("theme")) {
      this.theme = this.urlParams.get("theme");
    }

    this.headers = new HttpHeaders(
      {'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'}
    );
  }

  public refresh() {
    window.location.reload(true);
  }

  public switchTheme(name: string) {
    console.log("switching theme to ", name);

    this.theme = name;
    this.urlParams.set("theme", name);
    window.history.replaceState(
      null,
      "Shipwright",
      window.location.pathname + "?" + this.urlParams.toString()
    );
  }

  // Building Functions
  public async addBuilding(toAdd: Building) {
    try {
      const data = await this.http.post("buildings/"+toAdd.id, toAdd, {headers: this.headers}).toPromise();
      const response = this.converter.deserialize(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error adding the building " + toAdd.id + ": " + e);
    }
  }

  public async addBuildings(toAdd: Building[]) {
    try {
      const data = await this.http.post("buildings", toAdd, {headers: this.headers})
      const response = this.converter.deserialize(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error adding multiple buildings: " + e);
    }
  }

  public async getBuilding(buildingID: string) {
    try {
      const data = await this.http.get("buildings/"+buildingID, {headers: this.headers}).toPromise();
      const building = this.converter.deserialize(data, Building);

      return building;
    } catch (e) {
      throw new Error("error getting the building " + buildingID + ": " + e);
    }
  }

  public async getAllBuildings() {
    try {
      const data = await this.http.get("buildings", {headers: this.headers}).toPromise();
      const buildings = this.converter.deserialize(data, Building);

      return buildings;
    } catch (e) {
      throw new Error("error getting all buildings: " + e);
    }
  }

  public async updateBuilding(idToUpdate: string, toUpdate: Building) {
    try {
      const data = await this.http.put("buildings/"+idToUpdate+"/update", toUpdate, {headers: this.headers}).toPromise();
      const response = this.converter.deserialize(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error updating the building " + idToUpdate + ": " + e);
    }
  }

  public async updateBuildings(toUpdate: Building[]) {
    try {
      const data = await this.http.put("buildings/update", toUpdate, {headers: this.headers}).toPromise();
      const response = this.converter.deserialize(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error updating multiple buildings: " + e);
    }
  }

  public async deleteBuilding(buildingID: string) {
    try {
      const data = await this.http.get("buildings/"+buildingID+"/delete", {headers: this.headers}).toPromise();
      const response = this.converter.deserialize(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error deleting the building " + buildingID + ": " + e);
    }
  }

  // Room Functions
  public async addRoom(toAdd: Room) {
    try {
      const data = await this.http.post("rooms/"+toAdd.id, toAdd, {headers: this.headers}).toPromise();
      const response = this.converter.deserialize(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error adding the room " + toAdd.id + ": " + e);
    }
  }

  public async addRooms(toAdd: Room[]) {
    try {
      const data = await this.http.post("rooms", toAdd, {headers: this.headers})
      const response = this.converter.deserialize(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error adding multiple rooms: " + e);
    }
  }

  public async getRoom(roomID: string) {
    try {
      const data = await this.http.get("rooms/"+roomID, {headers: this.headers}).toPromise();
      const room = this.converter.deserialize(data, Room);

      return room;
    } catch (e) {
      throw new Error("error getting the room " + roomID + ": " + e);
    }
  }

  public async getAllRooms() {
    try {
      const data = await this.http.get("rooms", {headers: this.headers}).toPromise();
      const rooms = this.converter.deserialize(data, Room);

      return rooms;
    } catch (e) {
      throw new Error("error getting all rooms: " + e);
    }
  }

  public async getRoomsByBuilding(buildingID: string) {
    try {
      const data = await this.http.get("buildings/"+buildingID+"/rooms", {headers: this.headers}).toPromise();
      const rooms = this.converter.deserialize(data, Room);

      return rooms;
    } catch (e) {
      throw new Error("error getting all rooms in the building " + buildingID + ": " + e);
    }
  }

  public async updateRoom(idToUpdate: string, toUpdate: Room) {
    try {
      const data = await this.http.put("rooms/"+idToUpdate+"/update", toUpdate, {headers: this.headers}).toPromise();
      const response = this.converter.deserialize(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error updating the room " + idToUpdate + ": " + e);
    }
  }

  public async updateRooms(toUpdate: Room[]) {
    try {
      const data = await this.http.put("rooms/update", toUpdate, {headers: this.headers}).toPromise();
      const response = this.converter.deserialize(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error updating multiple rooms: " + e);
    }
  }

  public async deleteRoom(roomID: string) {
    try {
      const data = await this.http.get("rooms/"+roomID+"/delete", {headers: this.headers}).toPromise();
      const response = this.converter.deserialize(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error deleting the room " + roomID + ": " + e);
    }
  }

  public async getRoomConfigurations() {
    try {
      const data = await this.http.get("rooms/configurations", {headers: this.headers}).toPromise();
      const roomConfigs = this.converter.deserialize(data, RoomConfiguration);

      return roomConfigs;
    } catch (e) {
      throw new Error("error getting all room configurations: " + e);
    }
  }

  public async getRoomDesignations() {
    try {
      const data = await this.http.get("rooms/designations", {headers: this.headers}).toPromise();

      return data;
    } catch (e) {
      throw new Error("error getting all room designations: " + e);
    }
  }

  // Device Functions
  public async addDevice(toAdd: Device) {
    try {
      const data = await this.http.post("devices/"+toAdd.id, toAdd, {headers: this.headers}).toPromise();
      const response = this.converter.deserialize(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error adding the device " + toAdd.id + ": " + e);
    }
  }

  public async addDevices(toAdd: Device[]) {
    try {
      const data = await this.http.post("devices", toAdd, {headers: this.headers})
      const response = this.converter.deserialize(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error adding multiple devices: " + e);
    }
  }

  public async getDevice(deviceID: string) {
    try {
      const data = await this.http.get("devices/"+deviceID, {headers: this.headers}).toPromise();
      const device = this.converter.deserialize(data, Device);

      return device;
    } catch (e) {
      throw new Error("error getting the device " + deviceID + ": " + e);
    }
  }

  public async getAllDevices() {
    try {
      const data = await this.http.get("devices", {headers: this.headers}).toPromise();
      const devices = this.converter.deserialize(data, Device);

      return devices;
    } catch (e) {
      throw new Error("error getting all devices: " + e);
    }
  }

  public async getDevicesByRoom(roomID: string) {
    try {
      const data = await this.http.get("rooms/"+roomID+"/devices", {headers: this.headers}).toPromise();
      const devices = this.converter.deserialize(data, Device);

      return devices;
    } catch (e) {
      throw new Error("error getting all devices in the room " + roomID + ": " + e);
    }
  }

  public async getDevicesByRoomAndRole(roomID: string, roleID: string) {
    try {
      const data = await this.http.get("rooms/"+roomID+"/devices/roles/"+roleID, {headers: this.headers}).toPromise();
      const devices = this.converter.deserialize(data, Device);

      return devices;
    } catch (e) {
      throw new Error("error getting all devices in the room " + roomID + " that have the role " + roleID + ": " + e);
    }
  }

  public async getDevicesByTypeAndRole(typeID: string, roleID: string) {
    try {
      const data = await this.http.get("devices/types/"+typeID+"/roles/"+roleID, {headers: this.headers}).toPromise();
      const devices = this.converter.deserialize(data, Device);

      return devices;
    } catch (e) {
      throw new Error("error getting all devices of the type " + typeID + " that have the role " + roleID + ": " + e);
    }
  }

  public async updateDevice(idToUpdate: string, toUpdate: Device) {
    try {
      const data = await this.http.put("devices/"+idToUpdate+"/update", toUpdate, {headers: this.headers}).toPromise();
      const response = this.converter.deserialize(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error updating the device " + idToUpdate + ": " + e);
    }
  }

  public async updateDevices(toUpdate: Device[]) {
    try {
      const data = await this.http.put("devices/update", toUpdate, {headers: this.headers}).toPromise();
      const response = this.converter.deserialize(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error updating multiple devices: " + e);
    }
  }

  public async deleteDevice(deviceID: string) {
    try {
      const data = await this.http.get("devices/"+deviceID+"/delete", {headers: this.headers}).toPromise();
      const response = this.converter.deserialize(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error deleting the device " + deviceID + ": " + e);
    }
  }

  public async getDeviceTypes() {
    try {
      const data = await this.http.get("devices/types", {headers: this.headers}).toPromise();
      const deviceTypes = this.converter.deserialize(data, DeviceType);

      return deviceTypes;
    } catch (e) {
      throw new Error("error getting all device types: " + e);
    }
  }

  public async getDeviceRoles() {
    try {
      const data = await this.http.get("devices/roles", {headers: this.headers}).toPromise();
      const deviceRoles = this.converter.deserialize(data, Role);

      return deviceRoles;
    } catch (e) {
      throw new Error("error getting all device roles: " + e);
    }
  }

  // UIConfig Functions
  public async addUIConfig(toAdd: UIConfig) {
    try {
      const data = await this.http.post("uiconfigs/"+toAdd.id, toAdd, {headers: this.headers}).toPromise();
      const response = this.converter.deserialize(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error adding the uiconfig " + toAdd.id + ": " + e);
    }
  }

  public async addUIConfigs(toAdd: UIConfig[]) {
    try {
      const data = await this.http.post("uiconfigs", toAdd, {headers: this.headers})
      const response = this.converter.deserialize(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error adding multiple uiconfigs: " + e);
    }
  }

  public async getUIConfig(configID: string) {
    try {
      const data = await this.http.get("uiconfigs/"+configID, {headers: this.headers}).toPromise();
      const uiconfig = this.converter.deserialize(data, UIConfig);

      return uiconfig;
    } catch (e) {
      throw new Error("error getting the uiconfig " + configID + ": " + e);
    }
  }

  public async getAllUIConfigs() {
    try {
      const data = await this.http.get("uiconfigs", {headers: this.headers}).toPromise();
      const uiconfigs = this.converter.deserialize(data, UIConfig);

      return uiconfigs;
    } catch (e) {
      throw new Error("error getting all uiconfigs: " + e);
    }
  }

  public async updateUIConfig(idToUpdate: string, toUpdate: UIConfig) {
    try {
      const data = await this.http.put("uiconfigs/"+idToUpdate+"/update", toUpdate, {headers: this.headers}).toPromise();
      const response = this.converter.deserialize(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error updating the uiconfig " + idToUpdate + ": " + e);
    }
  }

  public async updateUIConfigs(toUpdate: UIConfig[]) {
    try {
      const data = await this.http.put("uiconfigs/update", toUpdate, {headers: this.headers}).toPromise();
      const response = this.converter.deserialize(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error updating multiple uiconfigs: " + e);
    }
  }

  public async deleteUIConfig(configID: string) {
    try {
      const data = await this.http.get("uiconfigs/"+configID+"/delete", {headers: this.headers}).toPromise();
      const response = this.converter.deserialize(data, DBResponse);

      return response;
    } catch (e) {
      throw new Error("error deleting the uiconfig " + configID + ": " + e);
    }
  }

  // Options Functions
  public async getIcons() {
    try {
      const data = await this.http.get("options/icons", {headers: this.headers}).toPromise();

      return data;
    } catch (e) {
      throw new Error("error getting the list of icons: " + e);
    }
  }

  public async getTemplates() {
    try {
      const data = await this.http.get("options/templates", {headers: this.headers}).toPromise();
      const templates = this.converter.deserialize(data, Template);

      return templates;
    } catch (e) {
      throw new Error("error getting the list of templates: " + e);
    }
  }

  // Metrics/Changes Functions
  public async getAddedBuildings() {
    try {
      const data = await this.http.get("metrics/added/buildings", {headers: this.headers}).toPromise();
      const list = await this.converter.deserialize(data, MetricsResponse);

      return list;
    } catch (e) {
      throw new Error("error getting the list of added buildings: " + e);
    }
  }

  public async getAddedRooms() {
    try {
      const data = await this.http.get("metrics/added/rooms", {headers: this.headers}).toPromise();
      const list = await this.converter.deserialize(data, MetricsResponse);

      return list;
    } catch (e) {
      throw new Error("error getting the list of added rooms: " + e);
    }
  }

  public async getAddedDevices() {
    try {
      const data = await this.http.get("metrics/added/devices", {headers: this.headers}).toPromise();
      const list = await this.converter.deserialize(data, MetricsResponse);

      return list;
    } catch (e) {
      throw new Error("error getting the list of added devices: " + e);
    }
  }

  public async getAddedUIConfigs() {
    try {
      const data = await this.http.get("metrics/added/uiconfigs", {headers: this.headers}).toPromise();
      const list = await this.converter.deserialize(data, MetricsResponse);

      return list;
    } catch (e) {
      throw new Error("error getting the list of added uiconfigs: " + e);
    }
  }

  public async getAddedObjects() {
    try {
      const data = await this.http.get("metrics/added", {headers: this.headers}).toPromise();
      const list = await this.converter.deserialize(data, MetricsResponse);

      return list;
    } catch (e) {
      throw new Error("error getting the list of added items: " + e);
    }
  }

  public async getUpdatedBuildings() {
    try {
      const data = await this.http.get("metrics/updated/buildings", {headers: this.headers}).toPromise();
      const list = await this.converter.deserialize(data, MetricsResponse);

      return list;
    } catch (e) {
      throw new Error("error getting the list of updated buildings: " + e);
    }
  }

  public async getUpdatedRooms() {
    try {
      const data = await this.http.get("metrics/updated/rooms", {headers: this.headers}).toPromise();
      const list = await this.converter.deserialize(data, MetricsResponse);

      return list;
    } catch (e) {
      throw new Error("error getting the list of updated rooms: " + e);
    }
  }

  public async getUpdatedDevices() {
    try {
      const data = await this.http.get("metrics/updated/devices", {headers: this.headers}).toPromise();
      const list = await this.converter.deserialize(data, MetricsResponse);

      return list;
    } catch (e) {
      throw new Error("error getting the list of updated devices: " + e);
    }
  }

  public async getUpdatedUIConfigs() {
    try {
      const data = await this.http.get("metrics/updated/uiconfigs", {headers: this.headers}).toPromise();
      const list = await this.converter.deserialize(data, MetricsResponse);

      return list;
    } catch (e) {
      throw new Error("error getting the list of updated uiconfigs: " + e);
    }
  }

  public async getUpdatedObjects() {
    try {
      const data = await this.http.get("metrics/updated", {headers: this.headers}).toPromise();
      const list = await this.converter.deserialize(data, MetricsResponse);

      return list;
    } catch (e) {
      throw new Error("error getting the list of updated items: " + e);
    }
  }

  public async getDeletedBuildings() {
    try {
      const data = await this.http.get("metrics/deleted/buildings", {headers: this.headers}).toPromise();
      const list = await this.converter.deserialize(data, MetricsResponse);

      return list;
    } catch (e) {
      throw new Error("error getting the list of deleted buildings: " + e);
    }
  }

  public async getDeletedRooms() {
    try {
      const data = await this.http.get("metrics/deleted/rooms", {headers: this.headers}).toPromise();
      const list = await this.converter.deserialize(data, MetricsResponse);

      return list;
    } catch (e) {
      throw new Error("error getting the list of deleted rooms: " + e);
    }
  }

  public async getDeletedDevices() {
    try {
      const data = await this.http.get("metrics/deleted/devices", {headers: this.headers}).toPromise();
      const list = await this.converter.deserialize(data, MetricsResponse);

      return list;
    } catch (e) {
      throw new Error("error getting the list of deleted devices: " + e);
    }
  }

  public async getDeletedUIConfigs() {
    try {
      const data = await this.http.get("metrics/deleted/uiconfigs", {headers: this.headers}).toPromise();
      const list = await this.converter.deserialize(data, MetricsResponse);

      return list;
    } catch (e) {
      throw new Error("error getting the list of deleted uiconfigs: " + e);
    }
  }

  public async getDeletedObjects() {
    try {
      const data = await this.http.get("metrics/deleted", {headers: this.headers}).toPromise();
      const list = await this.converter.deserialize(data, MetricsResponse);

      return list;
    } catch (e) {
      throw new Error("error getting the list of deleted items: " + e);
    }
  }

  // Authentication Functions
  public async getCurrentUsername() {
    try {
      const data = await this.http.get("users/current/username", {headers: this.headers}).toPromise();

      return data;
    } catch (e) {
      throw new Error("error getting the current user's username: " + e);
    }
  }

  public async getUserPermissions() {
    try {
      const data = await this.http.get("users/current/permissions", {headers: this.headers}).toPromise();
      const permissions = this.converter.deserialize(data, Any);

      return permissions;
    } catch (e) {
      throw new Error("error getting the current user's permissions: " + e);
    }
  }
}
