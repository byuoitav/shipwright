import { JsonObject, JsonProperty, JsonConverter, JsonCustomConvert } from "json2typescript";

@JsonConverter
class DateConverter implements JsonCustomConvert<Date> {
  serialize(date: Date): any {
    function pad(n) {
      return n < 10 ? "0" + n : n;
    }

    return (
      date.getUTCFullYear() +
      "-" +
      pad(date.getUTCMonth() + 1) +
      "-" +
      pad(date.getUTCDate()) +
      "T" +
      pad(date.getUTCHours()) +
      ":" +
      pad(date.getUTCMinutes()) +
      ":" +
      pad(date.getUTCSeconds()) +
      "Z"
    );
  }

  deserialize(date: any): Date {
    if (date == null) {
      return undefined;
    }

    return new Date(date);
  }
}

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

  Update() {
    this.deviceCount = 0;
    this.alertingCount = 0;
    this.goodCount = 0;

    for(let sd of this.deviceStates) {
      this.deviceCount++
      if(sd.alerting) {
        this.alertingCount++
      } else {
        this.goodCount++
      }
    }
  }
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

  @JsonProperty("room-states", [RoomStatus], true)
  roomStates: RoomStatus[] = Array<RoomStatus>();

  constructor() {
    
  }

  Update() {
    this.roomCount = 0;
    this.alertingCount = 0;
    this.goodCount = 0;

    for(let rs of this.roomStates) {
      this.roomCount++;
      if(rs.alertingCount > 0) {
        this.alertingCount++
      } else {
        this.goodCount++
      }
    }
  }
}