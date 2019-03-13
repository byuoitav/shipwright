import { JsonObject, JsonProperty } from "json2typescript";

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

  isNew = false;
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

  isNew = false;
}

@JsonObject("Person")
export class Person {
  @JsonProperty("name", String)
  name: string = undefined;

  @JsonProperty("net-id", String, true)
  id: string = undefined;
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

  isNew = false;
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
