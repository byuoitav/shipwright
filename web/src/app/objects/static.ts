import {
  JsonObject,
  JsonProperty,
  JsonConverter,
  JsonCustomConvert
} from "json2typescript";
import { RoomIssue, Alert } from "./alerts";
import { DateConverter } from "./date";

@JsonObject("StaticDevice")
export class StaticDevice {
  @JsonProperty("deviceID", String, true)
  deviceID: string = undefined;

  @JsonProperty("alerting", Boolean, true)
  alerting: boolean = undefined;

  @JsonProperty("notifications-suppressed", Boolean, true)
  notificationsSuppressed: boolean = undefined;

  @JsonProperty("building", String, true)
  building: string = undefined;

  @JsonProperty("room", String, true)
  room: string = undefined;

  @JsonProperty("hostname", String, true)
  hostname: string = undefined;

  @JsonProperty("last-state-received", DateConverter, true)
  lastStateReceived: Date = new Date(0);

  @JsonProperty("last-heartbeat", DateConverter, true)
  lastHeartbeat: Date = new Date(0);

  @JsonProperty("last-user-input", DateConverter, true)
  lastUserInput: Date = new Date(0);

  @JsonProperty("device-type", String, true)
  deviceType: string = undefined;

  @JsonProperty("device-class", String, true)
  deviceClass: string = undefined;

  @JsonProperty("device-name", String, true)
  deviceName: string = undefined;

  @JsonProperty("tags", [String], true)
  tags: string[] = Array<string>();

  @JsonProperty("power", String, true)
  power: string = undefined;

  @JsonProperty("active", String, true)
  active: string = undefined;

  @JsonProperty("secure", String, true)
  secure: string = undefined;

  @JsonProperty("hardware-version", String, true)
  hardwareVersion: string = undefined;

  @JsonProperty("software-version", String, true)
  softwareVersion: string = undefined;

  @JsonProperty("firmware-version", String, true)
  firmwareVersion: string = undefined;

  @JsonProperty("serial-number", String, true)
  serialNumber: string = undefined;

  @JsonProperty("ip-address", String, true)
  ipAddress: string = undefined;

  @JsonProperty("mac-address", String, true)
  macAddress: string = undefined;

  @JsonProperty("model-name", String, true)
  modelName: string = undefined;

  @JsonProperty("dns-address", String, true)
  dnsAddress: string = undefined;

  @JsonProperty("default-gateway", String, true)
  defaultGateway: string = undefined;

  @JsonProperty("websocket", String, true)
  websocket: string = undefined;

  @JsonProperty("websocket-count", Number, true)
  websocketCount: number = undefined;

  @JsonProperty("blanked", Boolean, true)
  blanked: boolean = undefined;

  @JsonProperty("input", String, true)
  input: string = undefined;

  @JsonProperty("lamp-hours", Number, true)
  lampHours: number = undefined;

  @JsonProperty("temperature", Number, true)
  temperature: number = undefined;

  @JsonProperty("active-signal", Boolean, true)
  activeSignal: boolean = undefined;

  @JsonProperty("muted", Boolean, true)
  muted: boolean = undefined;

  @JsonProperty("volume", Number, true)
  volume: number = undefined;

  @JsonProperty("battery-charge-bars", Number, true)
  batteryChargeBars: number = undefined;

  @JsonProperty("battery-charge-minutes", Number, true)
  batteryChargeMinutes: number = undefined;

  @JsonProperty("battery-charge-percentage", Number, true)
  batteryChargePercent: number = undefined;

  @JsonProperty("battery-charge-hours-minutes", String, true)
  batteryChargeHrsMins: string = undefined;

  @JsonProperty("battery-cycles", Number, true)
  batteryCycles: number = undefined;

  @JsonProperty("battery-type", String, true)
  batteryType: string = undefined;

  @JsonProperty("microphone-channel", String, true)
  microphoneChannel: string = undefined;

  @JsonProperty("interference", String, true)
  interference: string = undefined;

  @JsonProperty("current-user-count", Number, true)
  currentUserCount: number = undefined;

  @JsonProperty("presenter-count", Number, true)
  presenterCount: number = undefined;

  @JsonProperty("control", String, true)
  control: string = undefined;

  @JsonProperty("enable-notifications", String, true)
  enableNotifications: string = undefined;

  @JsonProperty("suppress-notifications", String, true)
  suppressNotifications: string = undefined;

  @JsonProperty("ViewDashboard", String, true)
  viewDashboard: string = undefined;

  @JsonProperty("cpu-usage-percent", Number, true)
  cpuUsagePercent: number = undefined;

  @JsonProperty("v-mem-used-percent", Number, true)
  vMemUsagePercent: number = undefined;

  @JsonProperty("s-mem-used-percent", Number, true)
  sMemUsagePercent: number = undefined;

  @JsonProperty("cpu-thermal0-temp", Number, true)
  cpuTemp: number = undefined;

  @JsonProperty("writes-to-mmcblk0", Number, true)
  diskWrites: number = undefined;

  @JsonProperty("disk-used-percent", Number, true)
  diskUsagePercent: number = undefined;

  @JsonProperty("avg-procs-u-sleep", Number, true)
  averageProcessesSleep: number = undefined;

  @JsonProperty("bcm2835_thermal0-temp", Number, true)
  broadcomChipTemp: number = undefined;

  @JsonProperty("status-message", String, true)
  statusMessage: string = undefined;

  @JsonProperty("transmit-rf-power", String, true)
  transmitRFPower: string = undefined;

  @JsonProperty("updateTimes", [String, DateConverter], true)
  updateTimes: Map<string, Date> = new Map();
}

@JsonObject("RoomStatus")
export class RoomStatus {
  @JsonProperty("room-id", String, true)
  roomID: string = undefined;

  @JsonProperty("device-count", Number, true)
  deviceCount: number = undefined;

  @JsonProperty("alerting-device-count", Number, true)
  alertingCount: number = undefined;

  @JsonProperty("good-device-count", Number, true)
  goodCount: number = undefined;

  @JsonProperty("device-states", [StaticDevice], true)
  deviceStates: StaticDevice[] = Array<StaticDevice>();
  roomIssues: RoomIssue[] = [];

  UpdateAlerts() {
    if (!this.roomIssues) {
      return;
    }

    this.deviceCount = 0;
    this.alertingCount = 0;
    this.goodCount = 0;
    const alertingDevices: string[] = [];
    if (this.deviceStates == null) {
      return;
    }
    for (const sd of this.deviceStates) {
      this.deviceCount++;
      if (this.roomIssues == null) {
        return;
      }
      for (const ri of this.roomIssues) {
        let alerting = false;
        for (const ad of ri.alertDevices) {
          if (sd.deviceID === ad) {
            let exists = false;
            for (const already of alertingDevices) {
              if (already === ad) {
                exists = true;
                break;
              }
            }
            if (!exists) {
              this.alertingCount++;
              alertingDevices.push(ad);
              alerting = true;
            }
          }
        }
        if (!alerting) {
          this.goodCount++;
        }
      }
    }
  }
}

@JsonObject("StaticRoom")
export class StaticRoom {
  @JsonProperty("buildingID", String, true)
  buildingID: string = undefined;

  @JsonProperty("roomID", String, true)
  roomID: string = undefined;

  @JsonProperty("maintenence-mode", Boolean, true)
  MaintenenceMode: Boolean = undefined;

  @JsonProperty("maintenence-mode-until", DateConverter, true)
  MaintenenceModeEndTime: Date = undefined;

  @JsonProperty("monitoring", Boolean, true)
  Monitoring: Boolean = undefined;

  @JsonProperty("tags", [String], true)
  Tags: string[] = Array<string>();

  @JsonProperty("designation", String, true)
  designation: string = undefined;

  @JsonProperty("system-type", [String], true)
  systemType: string[] = Array<string>();

  // Not sure what how to label this type Go: map[string]time.Time
  @JsonProperty("update-times", [String], true)
  updateTimes: [String] = undefined;
}

@JsonObject("CombinedRoomState")
export class CombinedRoomState {
  @JsonProperty("roomID", String, true)
  roomID: string = undefined;

  @JsonProperty("static-room", StaticRoom, true)
  staticRoom: StaticRoom = undefined;

  @JsonProperty("room-issues", [RoomIssue], true)
  roomIssue: RoomIssue[] = Array<RoomIssue>();

  @JsonProperty("all-alerts", [Alert], true)
  alerts: Alert[] = Array<Alert>();

  @JsonProperty("active-alert-count", Number, true)
  activeAlertCount: number = undefined;

  @JsonProperty("total-alert-count", Number, true)
  totalAlertCount: number = undefined;

  @JsonProperty("static-devices", [StaticDevice], true)
  deviceStates: StaticDevice[] = Array<StaticDevice>();
}

@JsonObject("BuildingStatus")
export class BuildingStatus {
  @JsonProperty("building-id", String, true)
  buildingID: string = undefined;

  @JsonProperty("room-count", Number, true)
  roomCount: number = undefined;

  @JsonProperty("alerting-room-count", Number, true)
  alertingCount: number = undefined;

  @JsonProperty("good-room-count", Number, true)
  goodCount: number = undefined;

  @JsonProperty("room-states", [CombinedRoomState], true)
  roomStates: CombinedRoomState[] = Array<CombinedRoomState>();
}
