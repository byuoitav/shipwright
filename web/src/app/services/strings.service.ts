import { Injectable } from "@angular/core";
import { MatChipInputEvent } from "@angular/material";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { Device } from "../objects/database";

export const PI_ICON = "video_label";
export const DMPS_ICON = "dns";
export const SCHEDULING_ICON = "today";
export const TIMECLOCK_ICON = "schedule";

@Injectable({
  providedIn: "root"
})

export class StringsService {
  public WebsiteTitle = "BYU OIT AV Monitoring";

  public Sharing = {
    true: "Sharing enabled",
    false: "Sharing disabled"
  };

  public SystemTypeIcon = {
    "dmps": DMPS_ICON,
    "pi": PI_ICON,
    "scheduling": SCHEDULING_ICON,
    "timeclock": TIMECLOCK_ICON
  };

  public DefaultDeviceNames = {
    "ADCP Sony VPL": "D",
    "AppleTV": "AppleTV",
    "Aruba8PortNetworkSwitch": "NS",
    "Blu50": "DSP",
    "ChromeCast": "ChromeCast",
    "Computer": "PC",
    "Crestron RMC-3 Gateway": "GW",
    "DM-MD16x16": "SW",
    "DividerSensors": "DS",
    "FunnelGateway": "GW",
    "JAP3GRX": "AVIPRX",
    "JAP3GTX": "AVIPTX",
    "Kramer VS-44DT": "SW",
    "Pi3": "CP",
    "PulseEight8x8": "SW",
    "QSC-Core-110F": "DSP",
    "SchedulingPanel": "SP",
    "ShureULXD": "RCV",
    "SonyPHZ10": "D",
    "SonyXBR": "D",
    "SonyXBR 43\"": "D",
    "SonyXBR 55\"": "D",
    "SonyXBR 65\"": "D",
    "SonyXBR 75\"": "D",
    "SonyVPL": "D",
    "Shure Microphone": "MIC",
    "VideoCard": "D",
    "non-controllable": "HDMI",
    "via-connect-pro": "VIA"
  };

  public DefaultDisplayNames = {
    "non-controllable": "HDMI",
    "via-connect-pro": "VIA",
    "Pi3": "Pi",
    "SonyXBR": "Flatpanel",
    "SonyXBR 43\"": "Flatpanel",
    "SonyXBR 55\"": "Flatpanel",
    "SonyXBR 65\"": "Flatpanel",
    "SonyXBR 75\"": "Flatpanel",
    "Computer": "PC",
    "ADCP Sony VPL": "Projector"
  };

  DefaultIcons = {
    "ADCP Sony VPL": "videocam",
    "AppleTV": "airplay",
    "Aruba8PortNetworkSwitch": "settings_ethernet",
    "Blu50": "speaker",
    "ChromeCast": "cast",
    "Computer": "desktop_windows",
    "Crestron RMC-3 Gateway": "security",
    "DM-MD16x16": "device_hub",
    "DividerSensors": "leak_add",
    "DMPS": "accessible_forward",
    "FunnelGateway": "security",
    "Gefen4x1": "device_hub",
    "JAP3GRX": "flip_to_back",
    "JAP3GTX": "flip_to_front",
    "Kramer VS-44DT": "device_hub",
    "NEC P502HL": "videocam",
    "Pi3": "video_label",
    "PulseEight8x8": "device_hub",
    "QSC-Core-110F": "surround_sound",
    "SchedulingPanel": "calendar_today",
    "Shure Microphone": "mic",
    "ShureULXD": "router",
    "SonyPHZ10": "videocam",
    "SonyVPL": "videocam",
    "SonyXBR": "tv",
    "SonyXBR 43\"": "tv",
    "SonyXBR 55\"": "tv",
    "SonyXBR 65\"": "tv",
    "SonyXBR 75\"": "tv",
    "VideoCard": "add_to_queue",
    "non-controllable": "settings_input_hdmi",
    "via-connect-pro": "settings_input_antenna",
    "control-processor": "video_label",
  };

  public readonly separatorKeyCodes: number[] = [ENTER, COMMA];

  constructor() {}

  public Title(word: string): string {
    if (word === undefined || word == null) {
      return "hmm?";
    }

    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  public AddTag(event: MatChipInputEvent, data: any): void {
    if (data.tags == null || data.tags.length === 0) {
      data.tags = [];
    }

    const input = event.input;
    const value = event.value;

    // Add our tag
    if ((value || "").trim()) {
      data.tags.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = "";
    }
  }

  public RemoveTag(tag: string, data: any): void {
    const index = data.tags.indexOf(tag);
    if (index >= 0) {
      data.tags.splice(index, 1);
    }
  }

  public AddChip(event: MatChipInputEvent, list: string[]) {
    const input = event.input;
    const value = event.value;

    if ((value || "").trim()) {
      if (!list.includes(value.trim())) {
        list.push(value.trim());
      }
    }

    if (input) {
      input.value = "";
    }
  }

  public RemoveChip(value: string, list: string[]) {
    const index = list.indexOf(value);

    if (index >= 0) {
      list.splice(index, 1);
    }
  }

  public SortDevicesAlphaNum(a: Device, b: Device) {
    // Sort the array first alphabetically and then numerically.
    const reA: RegExp = /[^a-zA-Z]/g;
    const reN: RegExp = /[^0-9]/g;

    const aA = a.id.replace(reA, "");
    const bA = b.id.replace(reA, "");

    if (aA === bA) {
        const aN = parseInt(a.id.replace(reN, ""), 10);
        const bN = parseInt(b.id.replace(reN, ""), 10);
        return aN === bN ? 0 : aN > bN ? 1 : -1;
    } else {
        return aA > bA ? 1 : -1;
    }
  }
}

