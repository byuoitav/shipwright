import { Injectable } from "@angular/core";
import { MatChipInputEvent } from "@angular/material";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { Device } from "../objects/database";
import { strictEqual } from 'assert';
import { Alert } from '../objects/alerts';

export const PI_ICON = "video_label";
export const DMPS_ICON = "dns";
export const SCHEDULING_ICON = "today";
export const TIMECLOCK_ICON = "schedule";

@Injectable({
  providedIn: "root"
})
export class TextService {
  public websiteTitle = "BYU OIT AV Monitoring";
  public mobileTitle = "SMEE";

  public sharing = {
    true: "Sharing enabled",
    false: "Sharing disabled"
  };

  public systemTypeIcon = {
    "dmps": DMPS_ICON,
    "pi": PI_ICON,
    "scheduling": SCHEDULING_ICON,
    "timeclock": TIMECLOCK_ICON
  };

  public readonly separatorKeyCodes: number[] = [ENTER, COMMA];

  constructor() { }

  public title(word: string): string {
    if (word === undefined || word == null) {
      return "title broken...";
    }

    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  public addChip(event: MatChipInputEvent, list: string[]) {
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

  public removeChip(value: string, list: string[]) {
    const index = list.indexOf(value);

    if (index >= 0) {
      list.splice(index, 1);
    }
  }

  public addAttribute(key: string, value: string, attributes: Map<string, any>): boolean {
    if (attributes == null) {
      attributes = new Map<string, any>();
    }

    if (key !== null && value !== null) {
      if (key.length > 0 && value.length > 0) {
        attributes.set(key, value);
        return true;
      }
    }

    return false;
  }

  public removeAttribute(key: string, attributes: Map<string, any>): boolean {
    if (attributes !== null) {
      if (attributes.has(key)) {
        attributes.delete(key);
        return true;
      }
    }
    return false;
  }

  public sortDevicesAlphaNum(a: Device, b: Device) {
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

  public sortAlphaNumByID(a: any, b: any) {
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

  public sortByActiveAlerts(a: Alert, b: Alert): number {
    if (a.active && !b.active) {
      return -1;
    } else if (!a.active && b.active) {
      return 1;
    } else {
      if (a.severity === "Critical" && b.severity !== "Critical") {
        return -1;
      } else if (a.severity !== "Critical" && b.severity === "Critical") {
        return 1;
      } else if (a.severity === "Warning" && b.severity === "Low") {
        return -1;
      } else if (a.severity === "Low" && b.severity === "Warning") {
        return 1;
      } else {
        return a.deviceID.localeCompare(b.deviceID);
      }
    }
  }

  getReadableTimestamp = (time: Date, withTime: boolean): string  => {
    const diff = new Date().valueOf() - time.valueOf();
    // const duration = Math.abs(Math.trunc((diff / (1000 * 60 * 60)) % 24));
    let answer;

    const minutes = Math.abs(Math.floor(( diff / (1000 * 60)) % 60));
    const hours   = Math.abs(Math.floor(( diff / (1000 * 60 * 60)) % 24));
    const days = Math.abs(Math.floor((diff / (1000 * 60 * 60 * 24))));
    // format age 1d 2h 3m
    if (withTime) {
      if (days === 0) {
        if (hours === 0) {
          answer = minutes.toString() + "m ago (" + time.toLocaleTimeString() + ")";
        } else {
          answer = hours.toString() + "h ago " + minutes.toString() + "m ago (" + time.toLocaleTimeString() + ")";
        }
      } else {
        answer = days.toString() + "d " + hours.toString() + "h " + minutes.toString() + "m ago (" + time.toLocaleTimeString() + ")";
      }
    } else {
      if (days === 0) {
        if (hours === 0) {
          answer = minutes.toString() + "m";
        } else {
          answer = hours.toString() + "h ago " + minutes.toString() + "m";
        }
      } else {
        answer = days.toString() + "d " + hours.toString() + "h " + minutes.toString() + "m";

      }
    }
    return answer;
  }

  timeIsZero(time: Date): boolean {
    if (time === undefined) {
      return true;
    }
    const zero = "0001-01-01T00:00:00.000Z";

    return time.toISOString() === zero;
  }

  getDeviceNameFromID(deviceID: string): string {
    return deviceID.split("-")[2];
  }

  extractNoteInfo = (note: string): string => {
    if (note == null) {
      return "";
    }
    let s = note;
    s = s.substring(s.indexOf("|") + 1);
    if (s.length > 40) {
      s = s.substring(0, 39);
    }
    return s;
  }
}
