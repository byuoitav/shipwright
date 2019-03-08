import { Injectable } from "@angular/core";
import { MatChipInputEvent } from "@angular/material";
import { COMMA, ENTER } from "@angular/cdk/keycodes";

@Injectable({
  providedIn: "root"
})
export class StringsService {
  constructor() {}

  public WebsiteTitle = "Shipwright";

  public Title(word: string): string {
    if (word === undefined || word == null) {
      return "hmm?";
    }

    return word.charAt(0).toUpperCase() + word.slice(1);
  }

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
    "VideoCard": "add_to_queue",
    "non-controllable": "settings_input_hdmi",
    "via-connect-pro": "settings_input_antenna",
    "control-processor":"video_label",
  };

  public readonly separatorKeyCodes: number[] = [ENTER, COMMA];

  public AddTag(event: MatChipInputEvent, data: any): void {
    if (data.tags == null || data.tags.length == 0) {
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

  public Sharing = {
    true: "Sharing enabled",
    false: "Sharing disabled"
  };

  public SystemTypeIcon = {
    "dmps": DMPS_ICON,
    "pi": PI_ICON,
    "scheduling": SCHEDULING_ICON,
    "timeclock": TIMECLOCK_ICON
  }
}

export const PI_ICON = "video_label";
export const DMPS_ICON = "dns";
export const SCHEDULING_ICON = "today";
export const TIMECLOCK_ICON = "schedule";
