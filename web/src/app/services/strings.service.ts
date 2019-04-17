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
    "Amplifier": "AMP",
    "AppleTV": "AppleTV",
    "Aruba48PortNetworkSwitch": "NS",
    "Aruba8PortNetworkSwitch": "NS",
    "Atlona4x1": "SW",
    "Blu50": "DSP",
    "ChromeCast": "ChromeCast",
    "Computer": "PC",
    "Crestron RMC-3 Gateway": "GW",
    "DM-MD16x16": "SW",
    "DM-MD32x32": "SW",
    "DMPS": "DMPS",
    "DividerSensors": "DS",
    "FunnelGateway": "GW",
    "Gefen4x1": "SW",
    "HDBTRX": "HDBTRX",
    "HDBTTX": "HDBTTX",
    "HDMI Passthrough": "HDMI",
    "JAP3GRX": "AVIPRX",
    "JAP3GTX": "AVIPTX",
    "Keydigital4x1": "SW",
    "Kramer VS-44DT": "SW",
    "Line Balancer": "LNBAL",
    "NEC P502HL": "D",
    "Network Switch": "NS",
    "Panasonic Projector": "D",
    "POE Injector": "POE",
    "Pi3": "CP",
    "Projector Screen": "PSCRN",
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
    "Speaker": "SPKR",
    "Shure Microphone": "MIC",
    "USB Extenders": "USB",
    "VideoCard": "D",
    "non-controllable": "HDMI",
    "via-connect-pro": "VIA"
  };

  public DefaultDisplayNames = {
    "ADCP Sony VPL": "Projector",
    "Amplifier": "Amp",
    "AppleTV": "AppleTV",
    "Aruba48PortNetworkSwitch": "Aruba Switch",
    "Aruba8PortNetworkSwitch": "Aruba Switch",
    "Atlona4x1": "Atlona Switch",
    "Blu50": "London DSP",
    "ChromeCast": "ChromeCast",
    "Computer": "PC",
    "Crestron RMC-3 Gateway": "Crestron Gateway",
    "DM-MD16x16": "Crestron 16x16",
    "DM-MD32x32": "Crestron 32x32",
    "DMPS": "DMPS",
    "DividerSensors": "Divider Sensors",
    "FunnelGateway": "Gateway Pi",
    "Gefen4x1": "Gefen Switch",
    "HDBTRX": "HDBT Recv.",
    "HDBTTX": "HDBT Tran.",
    "HDMI Passthrough": "HDMI",
    "JAP3GRX": "J+P Recv.",
    "JAP3GTX": "J+P Tran.",
    "Keydigital4x1": "Key Digital Switch",
    "Kramer VS-44DT": "Kramer Switch",
    "Line Balancer": "Line Balancer",
    "NEC P502HL": "Projector",
    "Network Switch": "Network Switch",
    "Panasonic Projector": "Projector",
    "POE Injector": "Injector",
    "Pi3": "Pi",
    "Projector Screen": "Screen",
    "PulseEight8x8": "Neo Switch",
    "QSC-Core-110F": "QSC DSP",
    "SchedulingPanel": "Scheduler",
    "ShureULXD": "Mic Recv.",
    "SonyPHZ10": "Projector",
    "SonyXBR": "Flatpanel",
    "SonyXBR 43\"": "Flatpanel",
    "SonyXBR 55\"": "Flatpanel",
    "SonyXBR 65\"": "Flatpanel",
    "SonyXBR 75\"": "Flatpanel",
    "SonyVPL": "Projector",
    "Speaker": "Speaker",
    "Shure Microphone": "Mic",
    "USB Extenders": "USB Ext.",
    "VideoCard": "Display",
    "non-controllable": "HDMI",
    "via-connect-pro": "VIA"
  };

  DefaultIcons = {
    "ADCP Sony VPL": "videocam",
    "Amplifier": "equalizer",
    "AppleTV": "airplay",
    "Aruba48PortNetworkSwitch": "settings_ethernet",
    "Aruba8PortNetworkSwitch": "settings_ethernet",
    "Atlona4x1": "view_list",
    "Blu50": "speaker",
    "ChromeCast": "cast",
    "Computer": "desktop_windows",
    "Crestron RMC-3 Gateway": "security",
    "DM-MD16x16": "view_list",
    "DM-MD32x32": "view_list",
    "DMPS": "dns",
    "DividerSensors": "leak_add",
    "FunnelGateway": "security",
    "Gefen4x1": "view_list",
    "HDBTRX": "flip_to_back",
    "HDBTTX": "flip_to_front",
    "HDMI Passthrough": "settings_input_hdmi",
    "JAP3GRX": "flip_to_back",
    "JAP3GTX": "flip_to_front",
    "Keydigital4x1": "view_list",
    "Kramer VS-44DT": "view_list",
    "Line Balancer": "tune",
    "NEC P502HL": "videocam",
    "Network Switch": "settings_ethernet",
    "Panasonic Projector": "videocam",
    "POE Injector": "power",
    "Pi3": "touch_app",
    "Projector Screen": "panorama",
    "PulseEight8x8": "view_list",
    "QSC-Core-110F": "speaker",
    "SchedulingPanel": "event_note",
    "ShureULXD": "router",
    "SonyPHZ10": "videocam",
    "SonyXBR": "tv",
    "SonyXBR 43\"": "tv",
    "SonyXBR 55\"": "tv",
    "SonyXBR 65\"": "tv",
    "SonyXBR 75\"": "tv",
    "SonyVPL": "videocam",
    "Speaker": "surround_sound",
    "Shure Microphone": "mic",
    "USB Extenders": "usb",
    "VideoCard": "video_call",
    "non-controllable": "settings_input_hdmi",
    "via-connect-pro": "settings_input_antenna"
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

  public SortAlphaNumByID(a: any, b: any) {
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

