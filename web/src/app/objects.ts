import { JsonObject, JsonProperty, JsonConverter, JsonCustomConvert, Any, JsonConvert } from "json2typescript";

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

@JsonObject("Building")
export class Building {
    @JsonProperty("_id", String, true)
    id: string = undefined;

    @JsonProperty("_rev", String, true)
    rev: string = undefined;

    @JsonProperty("name", String, true)
    name: string = undefined;

    @JsonProperty("description", String, true)
    description: string = undefined;

    @JsonProperty("tags", [String], true)
  tags: string[] = Array<string>();

  isNew: boolean = false;
}

@JsonObject("RoomConfiguration")
export class RoomConfiguration {
    @JsonProperty("_id", String)
    id: string = undefined;

    @JsonProperty("tags", [String], true)
    tags: string[] = Array<string>();
}

@JsonObject("Role")
export class Role {
    @JsonProperty("_id", String)
    id: string = undefined;

    @JsonProperty("description", String, true)
    description: string = undefined;

    @JsonProperty("tags", [String], true)
    tags: string[] = Array<string>();
}

@JsonObject("Port")
export class Port {
    @JsonProperty("_id", String)
    id: string = undefined;

    @JsonProperty("friendly_name", String, true)
    friendlyName: string = undefined;

    @JsonProperty("source_device", String, true)
    sourceDevice: string = undefined;

    @JsonProperty("destination_device", String, true)
    destinationDevice: string = undefined;

    @JsonProperty("description", String, true)
    description: string = undefined;

    @JsonProperty("tags", [String], true)
    tags: string[] = Array<string>();
}

@JsonObject("DeviceType")
export class DeviceType {
    @JsonProperty("_id", String)
    id: string = undefined;

    @JsonProperty("_rev", String, true)
    rev: string = undefined;

    @JsonProperty("description", String, true)
    description: string = undefined;

    @JsonProperty("display_name", String, true)
    displayName: string = undefined;

    @JsonProperty("input", Boolean, true)
    input: boolean = undefined;

    @JsonProperty("output", Boolean, true)
    output: boolean = undefined;

    @JsonProperty("source", Boolean, true)
    source: boolean = undefined;

    @JsonProperty("destination", Boolean, true)
    destination: boolean = undefined;

    @JsonProperty("roles", [Role], true)
    roles: Role[] = Array<Role>();

    @JsonProperty("ports", [Port], true)
    ports: Port[] = Array<Port>();

    @JsonProperty("tags", [String], true)
    tags: string[] = Array<string>();
}

@JsonObject("Device")
export class Device {
    @JsonProperty("_id", String)
    id: string = undefined;

    @JsonProperty("_rev", String, true)
    rev: string = undefined;

    @JsonProperty("name", String, true)
    name: string = undefined;

    @JsonProperty("address", String)
    address: string = undefined;

    @JsonProperty("description", String, true)
    description: string = undefined;

    @JsonProperty("display_name", String, true)
    displayName: string = undefined;

    @JsonProperty("type", DeviceType)
    type: DeviceType = undefined;

    @JsonProperty("roles", [Role])
    roles: Role[] = Array<Role>();

    @JsonProperty("ports", [Port], true)
    ports: Port[] = Array<Port>();

    @JsonProperty("tags", [String], true)
  tags: string[] = Array<string>();

  isNew: boolean = false;
}

@JsonObject("Room")
export class Room {
    @JsonProperty("_id", String)
    id: string = undefined;

    @JsonProperty("_rev", String, true)
    rev: string = undefined;

    @JsonProperty("name", String, true)
    name: string = undefined;

    @JsonProperty("description", String, true)
    description: string = undefined;

    @JsonProperty("configuration", RoomConfiguration)
    configuration: RoomConfiguration = undefined;

    @JsonProperty("designation", String)
    designation: string = undefined;

    @JsonProperty("devices", [Device], true)
    devices: Device[] = Array<Device>();

    @JsonProperty("tags", [String], true)
  tags: string[] = Array<string>();

  isNew: boolean = false;
}

@JsonObject("IOConfiguration")
export class IOConfiguration {
    @JsonProperty("name", String)
    name: string = undefined;

    @JsonProperty("icon", String)
    icon: string = undefined;
}

@JsonObject("AudioConfiguration")
export class AudioConfiguration {
    @JsonProperty("display", String)
    display: string = undefined;

    @JsonProperty("audioDevices", [String])
    audioDevices: string[] = Array<string>();

    @JsonProperty("roomWide", Boolean)
    roomWide: boolean = undefined;
}

@JsonObject("Panel")
export class Panel {
    @JsonProperty("hostname", String)
    hostname: string = undefined;

    @JsonProperty("uipath", String)
    uiPath: string = undefined;

    @JsonProperty("preset", String)
    preset: string = undefined;

    @JsonProperty("features", [String], true)
    features: string[] = Array<string>();
}

@JsonObject("Preset")
export class Preset {
    @JsonProperty("name", String)
    name: string = undefined;

    @JsonProperty("icon", String)
    icon: string = undefined;

    @JsonProperty("displays", [String], true)
    displays: string[] = Array<string>();

    @JsonProperty("shareableDisplays", [String], true)
    shareableDisplays: string[] = Array<string>();

    @JsonProperty("audioDevices", [String], true)
    audioDevices: string[] = Array<string>();

    @JsonProperty("inputs", [String], true)
    inputs: string[] = Array<string>();

    @JsonProperty("independentAudioDevices", [String], true)
    independentAudioDevices: string[] = Array<string>();
}

@JsonObject("UIConfig")
export class UIConfig {
    @JsonProperty("_id", String, true)
    id: string = undefined;

    @JsonProperty("_rev", String, true)
    rev: string = undefined;

    @JsonProperty("api", [String])
    API: string[] = Array<string>();

    @JsonProperty("panels", [Panel], true)
    panels: Panel[] = Array<Panel>();

    @JsonProperty("presets", [Preset], true)
    presets: Preset[] = Array<Preset>();

    @JsonProperty("inputConfiguration", [IOConfiguration], true)
    inputConfiguration: IOConfiguration[] = Array<IOConfiguration>();

    @JsonProperty("outputConfiguration", [IOConfiguration], true)
    outputConfiguration: IOConfiguration[] = Array<IOConfiguration>();

    @JsonProperty("audioConfiguration", [AudioConfiguration], true)
    audioConfiguration: AudioConfiguration[] = Array<AudioConfiguration>();
}

@JsonObject("Template")
export class Template {
    @JsonProperty("_id", String)
    id: string = undefined;

    @JsonProperty("_rev", String, true)
    rev: string = undefined;

    @JsonProperty("description", String, true)
    description: string = undefined;

    @JsonProperty("uiconfig", UIConfig, true)
    uiconfig: UIConfig = undefined;

    @JsonProperty("base_types", [String], true)
    baseTypes: string[] = Array<string>();
}

@JsonObject("DBResponse")
export class DBResponse {
    @JsonProperty("object_id", String, true)
    objectID: string = undefined;

    @JsonProperty("action", String, true)
    action: string = undefined;

    @JsonProperty("success", Boolean, true)
    success: boolean = undefined;

    @JsonProperty("message", String, true)
    message: string = undefined;

    @JsonProperty("error", String, true)
    error: string = undefined;
}

@JsonObject("ChangeRecord")
export class ChangeRecord {
    @JsonProperty("attribute_name", String, true)
    attributeName: string = undefined;

    @JsonProperty("old_value", String, true)
    oldValue: string = undefined;

    @JsonProperty("new_value", String, true)
    newValue: string = undefined;
}

@JsonObject("MetricsResponse")
export class MetricsResponse {
    @JsonProperty("object_id", String, true)
    objectID: string = undefined;

    @JsonProperty("action", String, true)
    action: string = undefined;

    @JsonProperty("username", String, true)
    username: string = undefined;

    @JsonProperty("timestamp", String, true)
    timestamp: string = undefined;

    @JsonProperty("changes", [ChangeRecord], true)
    changes: ChangeRecord[] = Array<ChangeRecord>();
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
    lastStateReceived: Date = undefined;

    @JsonProperty("last-heartbeat", DateConverter, true)
    lastHeartbeat: Date = undefined;

    @JsonProperty("last-user-input", DateConverter, true)
    lastUserInput: Date = undefined;

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

    @JsonProperty("lamp-hours", String, true)
    lampHours: string = undefined;

    @JsonProperty("temperature", String, true)
    temperature: string = undefined;

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

    // @JsonProperty("field-state-received", [String, DateConverter], true)
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

    @JsonProperty("room-states", [String, RoomStatus], true)
    roomStates: Map<string, RoomStatus> = new Map();
}

@JsonObject("ResolutionInfo")
export class ResolutionInfo {
    @JsonProperty("resolution-code", String)
    code: string = undefined;

    @JsonProperty("notes", [String])
    notes: string[] = Array<string>();

    @JsonProperty("resolved-at", Date)
    resolvedAt: Date = undefined;
}

@JsonObject("Alert")
export class Alert {
    @JsonProperty("alertID", String, true)
    alertID: string = undefined;

    @JsonProperty("buildingID", String, true)
    buildingID: string = undefined;

    @JsonProperty("roomID", String, true)
    roomID: string = undefined;

    @JsonProperty("deviceID", String, true)
    deviceID: string = undefined;

    @JsonProperty("type", String, true)
    type: string = undefined;

    @JsonProperty("category", String, true)
    category: string = undefined;

    @JsonProperty("incident-id", String)
    incidentID: string = undefined;

    @JsonProperty("severity", String, true)
    severity: string = undefined;

    @JsonProperty("message", String)
    message: string = undefined;

    @JsonProperty("message-log", [String])
    messageLog: string[] = Array<string>();

    @JsonProperty("data", Any)
    data: any = undefined;

    @JsonProperty("start-time", Date)
    startTime: Date = undefined;

    @JsonProperty("end-time", Date)
    endTime: Date = undefined;

    @JsonProperty("update-time", Date)
    updateTime: Date = undefined;

    @JsonProperty("active", Boolean)
    active: boolean = true

    @JsonProperty("resolved", Boolean)
    resolved: boolean = true

    @JsonProperty("responders", [String])
    responders: string[] = Array<string>();

    @JsonProperty("help-sent-at", Date)
    helpSentAt: Date = undefined;

    @JsonProperty("help-arrived-at", Date)
    helpArrivedAt: Date = undefined;

    @JsonProperty("resolution-info", ResolutionInfo)
    resolutionInfo: ResolutionInfo = undefined;

    @JsonProperty("alert-tags", [String], true)
    alertTags: string[] = Array<string>();

    @JsonProperty("room-tags", [String], true)
    roomTags: string[] = Array<string>();

    @JsonProperty("device-tags", [String], true)
    deviceTags: string[] = Array<string>();
}

export class AlertRow{
    roomID: string = undefined;
    systemTypeIcon: string = undefined;
    alerts: Alert[] = Array<Alert>();
    incidentID: string;
    expanded: boolean = false;
    helpSent: boolean = false;
    helpArrived: boolean = false;
}
