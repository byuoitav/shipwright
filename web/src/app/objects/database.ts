import {
  JsonObject,
  JsonProperty,
  JsonCustomConvert,
  JsonConverter
} from "json2typescript";

@JsonConverter
class MapConverter implements JsonCustomConvert<Map<string, any>> {
  serialize(map: Map<string, any>) {
    const obj: Object = Object.create(null);

    for (const [key, value] of map) {
      obj[key] = value;
    }

    return obj;
  }

  deserialize(obj: any): Map<string, any> {
    if (obj[""]) {
      delete obj[""];
    }
    const map = new Map<string, any>();

    for (const key of Object.keys(obj)) {
      if (key && obj[key]) {
        map.set(key, obj[key]);
      }
    }

    return map;
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

  isNew = false;

  constructor() {}

  Equals(imposter: Building, logMismatch?: boolean): boolean {
    if (imposter == null) {
      if (logMismatch) {
        console.log("building imposter was null");
      }
      return false;
    }
    if (this.id !== imposter.id) {
      if (logMismatch) {
        console.log("building IDs don't match: %s -- %s", this.id, imposter.id);
      }
      return false;
    }
    if (this.name !== imposter.name) {
      if (logMismatch) {
        console.log(
          "building names don't match: %s -- %s",
          this.name,
          imposter.name
        );
      }
      return false;
    }
    if (this.description !== imposter.description) {
      if (logMismatch) {
        console.log(
          "building descriptions don't match: %s -- %s",
          this.description,
          imposter.description
        );
      }
      return false;
    }
    if (this.tags == null && imposter.tags != null) {
      if (logMismatch) {
        console.log(
          "host building has no tags, imposter building does: " + imposter.tags
        );
      }
      return false;
    }
    if (this.tags != null && imposter.tags == null) {
      if (logMismatch) {
        console.log(
          "imposter building has no tags, host building does: " + this.tags
        );
      }
      return false;
    }
    if (this.tags != null && imposter.tags != null) {
      if (this.tags.length !== imposter.tags.length) {
        if (logMismatch) {
          console.log(
            "building tags are different size arrays: %d -- %d",
            this.tags.length,
            imposter.tags.length
          );
        }
        return false;
      }
      for (const tag of this.tags) {
        if (!imposter.tags.includes(tag)) {
          if (logMismatch) {
            console.log(
              "imposter building does not have the following tag: %s",
              tag
            );
          }
          return false;
        }
      }
    }
    // after all of this I believe they are the same
    return true;
  }
}

@JsonObject("RoomConfiguration")
export class RoomConfiguration {
  @JsonProperty("_id", String)
  id: string = undefined;

  @JsonProperty("tags", [String], true)
  tags: string[] = Array<string>();

  constructor(id?: string) {
    if (id != null) {
      this.id = id;
    }
  }

  Equals(imposter: RoomConfiguration, logMismatch?: boolean): boolean {
    if (imposter == null) {
      if (logMismatch) {
        console.log("room configuration imposter was null");
      }
      return false;
    }
    if (this.id !== imposter.id) {
      if (logMismatch) {
        console.log(
          "room configuration IDs don't match: %s -- %s",
          this.id,
          imposter.id
        );
      }
      return false;
    }
    if (this.tags == null && imposter.tags != null) {
      if (logMismatch) {
        console.log(
          "host room configuration has no tags, imposter room configuration does: " +
            imposter.tags
        );
      }
      return false;
    }
    if (this.tags != null && imposter.tags == null) {
      if (logMismatch) {
        console.log(
          "imposter room configuration has no tags, host room configuration does: " +
            this.tags
        );
      }
      return false;
    }
    if (this.tags != null && imposter.tags != null) {
      if (this.tags.length !== imposter.tags.length) {
        if (logMismatch) {
          console.log(
            "room configuration tags are different size arrays: %d -- %d",
            this.tags.length,
            imposter.tags.length
          );
        }
        return false;
      }
      for (const tag of this.tags) {
        if (!imposter.tags.includes(tag)) {
          if (logMismatch) {
            console.log(
              "imposter room configuration does not have the following tag: %s",
              tag
            );
          }
          return false;
        }
      }
    }
    // after all of this I believe they are the same
    return true;
  }
}

@JsonObject("Role")
export class Role {
  @JsonProperty("_id", String)
  id: string = undefined;

  @JsonProperty("description", String, true)
  description: string = undefined;

  @JsonProperty("tags", [String], true)
  tags: string[] = Array<string>();

  constructor() {}

  copy(): Role {
    const copy = new Role();
    copy.id = this.id;
    copy.description = this.description;
    copy.tags = this.tags.slice();
    return copy;
  }

  Equals(imposter: Role, logMismatch?: boolean): boolean {
    if (imposter == null) {
      if (logMismatch) {
        console.log("role imposter was null");
      }
      return false;
    }
    if (this.id !== imposter.id) {
      if (logMismatch) {
        console.log("role IDs don't match: %s -- %s", this.id, imposter.id);
      }
      return false;
    }
    if (this.description !== imposter.description) {
      if (logMismatch) {
        console.log(
          "role descriptions don't match: %s -- %s",
          this.description,
          imposter.description
        );
      }
      return false;
    }
    if (this.tags == null && imposter.tags != null) {
      if (logMismatch) {
        console.log(
          "host role has no tags, imposter role does: " + imposter.tags
        );
      }
      return false;
    }
    if (this.tags != null && imposter.tags == null) {
      if (logMismatch) {
        console.log("imposter role has no tags, host role does: " + this.tags);
      }
      return false;
    }
    if (this.tags != null && imposter.tags != null) {
      if (this.tags.length !== imposter.tags.length) {
        if (logMismatch) {
          console.log(
            "role tags are different size arrays: %d -- %d",
            this.tags.length,
            imposter.tags.length
          );
        }
        return false;
      }
      for (const tag of this.tags) {
        if (!imposter.tags.includes(tag)) {
          if (logMismatch) {
            console.log(
              "imposter role does not have the following tag: %s",
              tag
            );
          }
          return false;
        }
      }
    }
    // after all of this I believe they are the same
    return true;
  }
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

  constructor() {}

  copy(): Port {
    const copy = new Port();
    copy.id = this.id;
    copy.friendlyName = this.friendlyName;
    copy.sourceDevice = this.sourceDevice;
    copy.destinationDevice = this.destinationDevice;
    copy.description = this.description;
    copy.tags = this.tags.slice();
    return copy;
  }

  Equals(imposter: Port, logMismatch?: boolean): boolean {
    if (imposter == null) {
      if (logMismatch) {
        console.log("port imposter was null");
      }
      return false;
    }
    if (this.id !== imposter.id) {
      if (logMismatch) {
        console.log("port IDs don't match: %s -- %s", this.id, imposter.id);
      }
      return false;
    }
    if (this.friendlyName !== imposter.friendlyName) {
      if (logMismatch) {
        console.log(
          "port friendly names don't match: %s -- %s",
          this.friendlyName,
          imposter.friendlyName
        );
      }
      return false;
    }
    if (this.sourceDevice !== imposter.sourceDevice) {
      if (logMismatch) {
        console.log(
          "port source devices don't match: %s -- %s",
          this.sourceDevice,
          imposter.sourceDevice
        );
      }
      return false;
    }
    if (this.destinationDevice !== imposter.destinationDevice) {
      if (logMismatch) {
        console.log(
          "port destination devices don't match: %s -- %s",
          this.destinationDevice,
          imposter.destinationDevice
        );
      }
      return false;
    }
    if (this.description !== imposter.description) {
      if (logMismatch) {
        console.log(
          "port descriptions don't match: %s -- %s",
          this.description,
          imposter.description
        );
      }
      return false;
    }
    if (this.tags == null && imposter.tags != null) {
      if (logMismatch) {
        console.log(
          "host port has no tags, imposter port does: " + imposter.tags
        );
      }
      return false;
    }
    if (this.tags != null && imposter.tags == null) {
      if (logMismatch) {
        console.log("imposter port has no tags, host port does: " + this.tags);
      }
      return false;
    }
    if (this.tags != null && imposter.tags != null) {
      if (this.tags.length !== imposter.tags.length) {
        if (logMismatch) {
          console.log(
            "port tags are different size arrays: %d -- %d",
            this.tags.length,
            imposter.tags.length
          );
        }
        return false;
      }
      for (const tag of this.tags) {
        if (!imposter.tags.includes(tag)) {
          if (logMismatch) {
            console.log(
              "imposter port does not have the following tag: %s",
              tag
            );
          }
          return false;
        }
      }
    }
    // after all of this I believe they are the same
    return true;
  }
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

  @JsonProperty("default-name", String, true)
  defaultName: string = undefined;

  @JsonProperty("default-icon", String, true)
  defaultIcon: string = undefined;

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

  constructor() {}

  Equals(imposter: DeviceType, logMismatch?: boolean): boolean {
    if (imposter == null) {
      if (logMismatch) {
        console.log("port imposter was null");
      }
      return false;
    }
    if (this.id !== imposter.id) {
      if (logMismatch) {
        console.log("port IDs don't match: %s -- %s", this.id, imposter.id);
      }
      return false;
    }
    if (this.displayName !== imposter.displayName) {
      if (logMismatch) {
        console.log(
          "port display names don't match: %s -- %s",
          this.displayName,
          imposter.displayName
        );
      }
      return false;
    }
    if (this.description !== imposter.description) {
      if (logMismatch) {
        console.log(
          "port descriptions don't match: %s -- %s",
          this.description,
          imposter.description
        );
      }
      return false;
    }
    if (this.input != null && imposter.input != null) {
      if (this.input !== imposter.input) {
        if (logMismatch) {
          console.log(
            "types are not both inputs: Host: %s -- Imposter: %s",
            this.input,
            imposter.input
          );
        }
        return false;
      }
    }
    if (this.output != null && imposter.output != null) {
      if (this.output !== imposter.output) {
        if (logMismatch) {
          console.log(
            "types are not both outputs: Host: %s -- Imposter: %s",
            this.output,
            imposter.output
          );
        }
        return false;
      }
    }
    if (this.source != null && imposter.source != null) {
      if (this.source !== imposter.source) {
        if (logMismatch) {
          console.log(
            "types are not both sources: Host: %s -- Imposter: %s",
            this.source,
            imposter.source
          );
        }
        return false;
      }
    }
    if (this.destination != null && imposter.destination != null) {
      if (this.destination !== imposter.destination) {
        if (logMismatch) {
          console.log(
            "types are not both destinations: Host: %s -- Imposter: %s",
            this.destination,
            imposter.destination
          );
        }
        return false;
      }
    }
    // roles
    if (this.roles == null && imposter.roles != null) {
      if (logMismatch) {
        console.log(
          "host type has no roles, imposter type does: " + imposter.roles
        );
      }
      return false;
    }
    if (this.roles != null && imposter.roles == null) {
      if (logMismatch) {
        console.log(
          "imposter type has no roles, host type does: " + this.roles
        );
      }
      return false;
    }
    if (this.roles != null && imposter.roles != null) {
      if (this.roles.length !== imposter.roles.length) {
        if (logMismatch) {
          console.log(
            "type roles are different size arrays: %d -- %d",
            this.roles.length,
            imposter.roles.length
          );
        }
        return false;
      }
      for (const role of this.roles) {
        let found = false;
        for (const impRole of imposter.roles) {
          if (role.id === impRole.id) {
            found = true;
            if (!role.Equals(impRole)) {
              if (logMismatch) {
                console.log(
                  "Role mismatch on type %s and type %s",
                  this.id,
                  imposter.id
                );
              }
              return false;
            }
          }
        }
        if (!found) {
          if (logMismatch) {
            console.log(
              "Role missing on type %s that is on type %s: %s",
              imposter.id,
              this.id,
              role.id
            );
          }
          return false;
        }
      }
    }
    // ports
    if (this.ports == null && imposter.ports != null) {
      if (logMismatch) {
        console.log(
          "host type has no ports, imposter type does: " + imposter.ports
        );
      }
      return false;
    }
    if (this.ports != null && imposter.ports == null) {
      if (logMismatch) {
        console.log(
          "imposter type has no ports, host type does: " + this.ports
        );
      }
      return false;
    }
    if (this.ports != null && imposter.ports != null) {
      if (this.ports.length !== imposter.ports.length) {
        if (logMismatch) {
          console.log(
            "type ports are different size arrays: %d -- %d",
            this.ports.length,
            imposter.ports.length
          );
        }
        return false;
      }
      for (const port of this.ports) {
        let found = false;
        for (const impPort of imposter.ports) {
          if (port.id === impPort.id) {
            found = true;
            if (!port.Equals(impPort)) {
              if (logMismatch) {
                console.log(
                  "port mismatch on type %s and type %s",
                  this.id,
                  imposter.id
                );
              }
              return false;
            }
          }
        }
        if (!found) {
          if (logMismatch) {
            console.log(
              "port missing on type %s that is on type %s: %s",
              imposter.id,
              this.id,
              port.id
            );
          }
          return false;
        }
      }
    }
    // tags
    if (this.tags == null && imposter.tags != null) {
      if (logMismatch) {
        console.log(
          "host type has no tags, imposter type does: " + imposter.tags
        );
      }
      return false;
    }
    if (this.tags != null && imposter.tags == null) {
      if (logMismatch) {
        console.log("imposter type has no tags, host type does: " + this.tags);
      }
      return false;
    }
    if (this.tags != null && imposter.tags != null) {
      if (this.tags.length !== imposter.tags.length) {
        if (logMismatch) {
          console.log(
            "type tags are different size arrays: %d -- %d",
            this.tags.length,
            imposter.tags.length
          );
        }
        return false;
      }
      for (const tag of this.tags) {
        if (!imposter.tags.includes(tag)) {
          if (logMismatch) {
            console.log(
              "imposter type does not have the following tag: %s",
              tag
            );
          }
          return false;
        }
      }
    }
    // after all of this I believe they are the same
    return true;
  }
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

  @JsonProperty("attributes", MapConverter, true)
  attributes: Map<string, any> = undefined;

  isNew = false;

  constructor(baseType?: DeviceType, preset?: AttributeSet) {
    if (baseType != null) {
      this.type = new DeviceType();
      this.type.id = baseType.id;
      for (const r of baseType.roles) {
        this.roles.push(r.copy());
      }
      for (const p of baseType.ports) {
        this.ports.push(p.copy());
      }
      this.tags.concat(baseType.tags);
    }

    if (preset != null) {
      this.attributes = new Map<string, any>();
      for (const [k, v] of preset.attributes) {
        this.attributes.set(k, v);
      }
    }
  }

  Equals(imposter: Device): boolean {
    if (imposter == null) {
      return false;
    }
    if (this.id !== imposter.id) {
      return false;
    }
    if (this.name !== imposter.name) {
      return false;
    }
    if (this.address !== imposter.address) {
      return false;
    }
    if (this.description !== imposter.description) {
      return false;
    }
    if (this.displayName !== imposter.displayName) {
      return false;
    }
    if (this.type.id !== imposter.type.id) {
      return false;
    }
    if (this.roles == null && imposter.roles != null) {
      return false;
    }
    if (this.roles != null && imposter.roles == null) {
      return false;
    }
    if (this.roles != null && imposter.roles != null) {
      if (this.roles.length !== imposter.roles.length) {
        return false;
      }
      for (const role of this.roles) {
        let found = false;
        for (const impRole of imposter.roles) {
          if (role.id === impRole.id) {
            found = true;
            if (!role.Equals(impRole)) {
              return false;
            }
          }
        }
        if (!found) {
          return false;
        }
      }
    }
    if (this.ports == null && imposter.ports != null) {
      return false;
    }
    if (this.ports != null && imposter.ports == null) {
      return false;
    }
    if (this.ports != null && imposter.ports != null) {
      if (this.ports.length !== imposter.ports.length) {
        return false;
      }
      for (const port of this.ports) {
        let found = false;
        for (const impPort of imposter.ports) {
          if (port.id === impPort.id) {
            found = true;
            if (!port.Equals(impPort)) {
              return false;
            }
          }
        }
        if (!found) {
          return false;
        }
      }
    }
    if (this.tags == null && imposter.tags != null) {
      return false;
    }
    if (this.tags != null && imposter.tags == null) {
      return false;
    }
    if (this.tags != null && imposter.tags != null) {
      if (this.tags.length !== imposter.tags.length) {
        return false;
      }
      for (const tag of this.tags) {
        if (!imposter.tags.includes(tag)) {
          return false;
        }
      }
    }
    // after all of this I believe they are the same
    return true;
  }
}

@JsonObject("Person")
export class Person {
  @JsonProperty("name", String)
  name: string = undefined;

  @JsonProperty("net-id", String, true)
  id: string = undefined;

  constructor() {}

  Equals(imposter: Person): boolean {
    if (imposter == null) {
      return false;
    }
    if (this.name !== imposter.name) {
      return false;
    }
    if (this.id !== imposter.id) {
      return false;
    }
    // after all of this I believe they are the same
    return true;
  }
}

@JsonConverter
class SignalPathConverter implements JsonCustomConvert<Map<string, string[]>> {
  serialize(map: Map<string, string[]>) {
    return undefined;
  }

  deserialize(obj: any): Map<string, string[]> {
    if (obj[""]) {
      delete obj[""];
    }
    const map = new Map<string, string[]>();

    for (const key of Object.keys(obj)) {
      if (key && obj[key]) {
        map.set(key, obj[key].filter((v: any) => v)); // filter to remove empty values
      }
    }

    return map;
  }
}

@JsonObject("SignalPaths")
export class SignalPaths {
  @JsonProperty("video", SignalPathConverter, true)
  video: Map<string, string[]> = undefined;

  constructor() {}
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

  @JsonProperty("signal-paths", SignalPaths, true)
  signalPaths: SignalPaths = undefined;

  @JsonProperty("attributes", MapConverter, true)
  attributes: Map<string, any> = undefined;

  isNew = false;

  constructor() {
    this.configuration = new RoomConfiguration("Default");
    this.designation = "production";
  }

  Equals(imposter: Room): boolean {
    if (imposter == null) {
      return false;
    }
    if (this.id !== imposter.id) {
      return false;
    }
    if (this.name !== imposter.name) {
      return false;
    }
    if (this.description !== imposter.description) {
      return false;
    }
    if (!this.configuration.Equals(imposter.configuration)) {
      return false;
    }
    if (this.designation !== imposter.designation) {
      return false;
    }
    // if (this.devices.length !== imposter.devices.length) { return false; }
    if (this.tags == null && imposter.tags != null) {
      return false;
    }
    if (this.tags != null && imposter.tags == null) {
      return false;
    }
    if (this.tags != null && imposter.tags != null) {
      if (this.tags.length !== imposter.tags.length) {
        return false;
      }
      for (const tag of this.tags) {
        if (!imposter.tags.includes(tag)) {
          return false;
        }
      }
    }
    // after all of this I believe they are the same
    return true;
  }
}

@JsonObject("IOConfiguration")
export class IOConfiguration {
  @JsonProperty("name", String)
  name: string = undefined;

  @JsonProperty("icon", String)
  icon: string = undefined;

  constructor(name?: string, icon?: string) {
    if (name != null) {
      this.name = name;
    }
    if (icon != null) {
      this.icon = icon;
    }
  }

  Equals(imposter: IOConfiguration): boolean {
    if (imposter == null) {
      return false;
    }
    if (this.name !== imposter.name) {
      return false;
    }
    if (this.icon !== imposter.icon) {
      return false;
    }
    // after all of this I believe they are the same
    return true;
  }
}

@JsonObject("AudioConfiguration")
export class AudioConfiguration {
  @JsonProperty("display", String)
  display: string = undefined;

  @JsonProperty("audioDevices", [String])
  audioDevices: string[] = Array<string>();

  @JsonProperty("roomWide", Boolean)
  roomWide: boolean = undefined;

  constructor() {}

  Equals(imposter: AudioConfiguration): boolean {
    if (imposter == null) {
      return false;
    }
    if (this.display !== imposter.display) {
      return false;
    }
    if (this.audioDevices == null && imposter.audioDevices != null) {
      return false;
    }
    if (this.audioDevices != null && imposter.audioDevices == null) {
      return false;
    }
    if (this.audioDevices != null && imposter.audioDevices != null) {
      if (this.audioDevices.length !== imposter.audioDevices.length) {
        return false;
      }
      for (const audio of this.audioDevices) {
        if (!imposter.audioDevices.includes(audio)) {
          return false;
        }
      }
    }
    if (this.roomWide !== imposter.roomWide) {
      return false;
    }
    // after all of this I believe they are the same
    return true;
  }
}

@JsonObject("Panel")
export class Panel {
  @JsonProperty("hostname", String)
  hostname: string = undefined;

  @JsonProperty("uipath", String, true)
  uiPath: string = undefined;

  @JsonProperty("preset", String, true)
  controlGroup: string = undefined;

  @JsonProperty("features", [String], true)
  features: string[] = Array<string>();

  constructor(id?: string) {
    if (id !== null) {
      this.hostname = id;
    }
  }

  GetDeviceName() {
    return this.hostname.substring(this.hostname.lastIndexOf("-") + 1);
  }

  Equals(imposter: Panel): boolean {
    if (imposter == null) {
      return false;
    }
    if (this.hostname !== imposter.hostname) {
      return false;
    }
    if (this.uiPath !== imposter.uiPath) {
      return false;
    }
    if (this.controlGroup !== imposter.controlGroup) {
      return false;
    }
    if (this.features == null && imposter.features != null) {
      return false;
    }
    if (this.features != null && imposter.features == null) {
      return false;
    }
    if (this.features != null && imposter.features != null) {
      if (this.features.length !== imposter.features.length) {
        return false;
      }
      for (const feature of this.features) {
        if (!imposter.features.includes(feature)) {
          return false;
        }
      }
    }
    // after all of this I believe they are the same
    return true;
  }
}

@JsonObject("ControlGroup")
export class ControlGroup {
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

  constructor() {}

  Equals(imposter: ControlGroup): boolean {
    if (imposter == null) {
      return false;
    }
    if (this.name !== imposter.name) {
      return false;
    }
    if (this.icon !== imposter.icon) {
      return false;
    }
    if (this.displays == null && imposter.displays != null) {
      return false;
    }
    if (this.displays != null && imposter.displays == null) {
      return false;
    }
    if (this.displays != null && imposter.displays != null) {
      if (this.displays.length !== imposter.displays.length) {
        return false;
      }
      for (const display of this.displays) {
        if (!imposter.displays.includes(display)) {
          return false;
        }
      }
    }
    if (this.shareableDisplays == null && imposter.shareableDisplays != null) {
      return false;
    }
    if (this.shareableDisplays != null && imposter.shareableDisplays == null) {
      return false;
    }
    if (this.shareableDisplays != null && imposter.shareableDisplays != null) {
      if (this.shareableDisplays.length !== imposter.shareableDisplays.length) {
        return false;
      }
      for (const display of this.shareableDisplays) {
        if (!imposter.shareableDisplays.includes(display)) {
          return false;
        }
      }
    }
    if (this.audioDevices == null && imposter.audioDevices != null) {
      return false;
    }
    if (this.audioDevices != null && imposter.audioDevices == null) {
      return false;
    }
    if (this.audioDevices != null && imposter.audioDevices != null) {
      if (this.audioDevices.length !== imposter.audioDevices.length) {
        return false;
      }
      for (const audio of this.audioDevices) {
        if (!imposter.audioDevices.includes(audio)) {
          return false;
        }
      }
    }
    if (this.inputs == null && imposter.inputs != null) {
      return false;
    }
    if (this.inputs != null && imposter.inputs == null) {
      return false;
    }
    if (this.inputs != null && imposter.inputs != null) {
      if (this.inputs.length !== imposter.inputs.length) {
        return false;
      }
      for (const input of this.inputs) {
        if (!imposter.inputs.includes(input)) {
          return false;
        }
      }
    }
    if (
      this.independentAudioDevices == null &&
      imposter.independentAudioDevices != null
    ) {
      return false;
    }
    if (
      this.independentAudioDevices != null &&
      imposter.independentAudioDevices == null
    ) {
      return false;
    }
    if (
      this.independentAudioDevices != null &&
      imposter.independentAudioDevices != null
    ) {
      if (
        this.independentAudioDevices.length !==
        imposter.independentAudioDevices.length
      ) {
        return false;
      }
      for (const audio of this.independentAudioDevices) {
        if (!imposter.independentAudioDevices.includes(audio)) {
          return false;
        }
      }
    }
    // after all of this I believe they are the same
    return true;
  }
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

  @JsonProperty("presets", [ControlGroup], true)
  controlGroups: ControlGroup[] = Array<ControlGroup>();

  @JsonProperty("inputConfiguration", [IOConfiguration], true)
  inputConfiguration: IOConfiguration[] = Array<IOConfiguration>();

  @JsonProperty("outputConfiguration", [IOConfiguration], true)
  outputConfiguration: IOConfiguration[] = Array<IOConfiguration>();

  @JsonProperty("audioConfiguration", [AudioConfiguration], true)
  audioConfiguration: AudioConfiguration[] = Array<AudioConfiguration>();

  constructor(roomID?: string) {
    if (roomID != null) {
      this.id = roomID;
    }
  }

  Equals(imposter: UIConfig): boolean {
    if (imposter == null) {
      return false;
    }
    if (this.id !== imposter.id) {
      return false;
    }
    if (this.API == null && imposter.API != null) {
      return false;
    }
    if (this.API != null && imposter.API == null) {
      return false;
    }
    if (this.API != null && imposter.API != null) {
      if (this.API.length !== imposter.API.length) {
        return false;
      }
      for (const api of this.API) {
        if (!imposter.API.includes(api)) {
          return false;
        }
      }
    }
    if (this.panels == null && imposter.panels != null) {
      return false;
    }
    if (this.panels != null && imposter.panels == null) {
      return false;
    }
    if (this.panels != null && imposter.panels != null) {
      if (this.panels.length !== imposter.panels.length) {
        return false;
      }
      for (const panel of this.panels) {
        let found = false;
        for (const impPanel of imposter.panels) {
          if (panel.hostname === impPanel.hostname) {
            found = true;
            if (!panel.Equals(impPanel)) {
              return false;
            }
          }
        }
        if (!found) {
          return false;
        }
      }
    }
    if (this.controlGroups == null && imposter.controlGroups != null) {
      return false;
    }
    if (this.controlGroups != null && imposter.controlGroups == null) {
      return false;
    }
    if (this.controlGroups != null && imposter.controlGroups != null) {
      if (this.controlGroups.length !== imposter.controlGroups.length) {
        return false;
      }
      for (const preset of this.controlGroups) {
        let found = false;
        for (const impPreset of imposter.controlGroups) {
          if (preset.name === impPreset.name) {
            found = true;
            if (!preset.Equals(impPreset)) {
              return false;
            }
          }
        }
        if (!found) {
          return false;
        }
      }
    }
    if (
      this.inputConfiguration == null &&
      imposter.inputConfiguration != null
    ) {
      return false;
    }
    if (
      this.inputConfiguration != null &&
      imposter.inputConfiguration == null
    ) {
      return false;
    }
    if (
      this.inputConfiguration != null &&
      imposter.inputConfiguration != null
    ) {
      if (
        this.inputConfiguration.length !== imposter.inputConfiguration.length
      ) {
        return false;
      }
      for (const io of this.inputConfiguration) {
        let found = false;
        for (const impIO of imposter.inputConfiguration) {
          if (io.name === impIO.name) {
            found = true;
            if (!io.Equals(impIO)) {
              return false;
            }
          }
        }
        if (!found) {
          return false;
        }
      }
    }
    if (
      this.outputConfiguration == null &&
      imposter.outputConfiguration != null
    ) {
      return false;
    }
    if (
      this.outputConfiguration != null &&
      imposter.outputConfiguration == null
    ) {
      return false;
    }
    if (
      this.outputConfiguration != null &&
      imposter.outputConfiguration != null
    ) {
      if (
        this.outputConfiguration.length !== imposter.outputConfiguration.length
      ) {
        return false;
      }
      for (const io of this.outputConfiguration) {
        let found = false;
        for (const impIO of imposter.outputConfiguration) {
          if (io.name === impIO.name) {
            found = true;
            if (!io.Equals(impIO)) {
              return false;
            }
          }
        }
        if (!found) {
          return false;
        }
      }
    }
    if (
      this.audioConfiguration == null &&
      imposter.audioConfiguration != null
    ) {
      return false;
    }
    if (
      this.audioConfiguration != null &&
      imposter.audioConfiguration == null
    ) {
      return false;
    }
    if (
      this.audioConfiguration != null &&
      imposter.audioConfiguration != null
    ) {
      if (
        this.audioConfiguration.length !== imposter.audioConfiguration.length
      ) {
        return false;
      }
      for (const audio of this.audioConfiguration) {
        let found = false;
        for (const impAudio of imposter.audioConfiguration) {
          if (audio.display === impAudio.display) {
            found = true;
            if (!audio.Equals(impAudio)) {
              return false;
            }
          }
        }
        if (!found) {
          return false;
        }
      }
    }
    // after all of this I believe they are the same
    return true;
  }
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

  constructor() {}
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

  constructor() {}
}

@JsonObject("AttributeSet")
export class AttributeSet {
  @JsonProperty("name", String, true)
  name: string = undefined;

  @JsonProperty("device-type", String, true)
  deviceType: string = undefined;

  @JsonProperty("device-name", String, true)
  deviceName: string = undefined;

  @JsonProperty("device-icon", String, true)
  deviceIcon: string = undefined;

  @JsonProperty("attributes", MapConverter, true)
  attributes: Map<string, any> = undefined;
}

@JsonObject("Group")
export class Group {
  @JsonProperty("_id", String, true)
  name: string = undefined;

  @JsonProperty("icon", String, true)
  icon: string = undefined;

  @JsonProperty("sub-groups", [Group], true)
  subgroups: Group[] = Array<Group>();

  @JsonProperty("presets", [AttributeSet], true)
  presets: AttributeSet[] = Array<AttributeSet>();
}

@JsonObject("MenuTree")
export class MenuTree {
  @JsonProperty("groups", [Group], true)
  groups: Group[] = Array<Group>();
}
