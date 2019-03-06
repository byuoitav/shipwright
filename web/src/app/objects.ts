import {
  JsonObject,
  JsonProperty,
  JsonConverter,
  JsonCustomConvert,
  Any,
} from "json2typescript";

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

export const PI_ICON = "video_label";
export const DMPS_ICON = "local_atm";
export const SCHEDULING_ICON = "today";
export const TIMECLOCK_ICON = "schedule";

// export class RoomAlerts {
//   roomID: string = undefined;
//   systemTypeIcon: string = undefined;
//   private alerts: Alert[] = Array<Alert>();
//   map: Map<string, Alert> = new Map();
//   incidentID: string;
//   maintenanceMode: boolean = false;
//   expanded: boolean = false;
//   helpSent: boolean = false;
//   helpArrived: boolean = false;
//   sentDate: Date = new Date(0);
//   arriveDate: Date = new Date(0);

//   constructor(roomID?: string, alertList?: Alert[]) {
//     if (roomID != null && roomID.length > 0) {
//       this.roomID = roomID;
//     }

//     if (alertList != null) {
//       this.map.clear();
//       this.alerts = alertList;

//       for (let a of this.alerts) {
//         if (a.helpSentAt != null) {
//           // this.helpSent = true
//         }
//         if (a.helpArrivedAt != null) {
//           // this.helpArrived = true
//         }
//         if (a.incidentID != null) {
//           this.incidentID = a.incidentID;
//         }
//         if (a.systemType == "dmps") {
//           this.systemTypeIcon = DMPS_ICON;
//         }
//         if(a.systemType == "pi") {
//           this.systemTypeIcon = PI_ICON;
//         }
//         if(a.systemType == "scheduling") {
//           this.systemTypeIcon = SCHEDULING_ICON;
//         }
//         if(a.systemType == "timeclock") {
//           this.systemTypeIcon = TIMECLOCK_ICON;
//         }

//         if (!a.SentIsZero()) {
//           this.sentDate = a.helpSentAt;
//         }

//         if (!a.ArriveIsZero()) {
//           this.arriveDate = a.helpArrivedAt;
//         }

//         this.map.set(a.alertID, a);
//       }
//     }
//   }

//   GetAlerts() {
//     this.alerts = [];
//     this.map.forEach((value, key) => {
//       this.alerts.push(value);
//     });
//     return this.alerts;
//   }

//   GetVisibleAlerts(severity?: string) {
//     let visAlerts = [];
//     this.map.forEach((v, k) => {
//       if (!v.resolved) {
//         if (severity == null || severity.length == 0 || severity == "all-alerts") {
//           visAlerts.push(v);
//         } else if (severity.toLowerCase() === v.severity.toLowerCase()) {
//           visAlerts.push(v);
//         }
//       }
//     });

//     return visAlerts;
//   }

//   GetActiveAlertCount(severity?: string) {
//     let count = 0;
//     for(let alert of this.GetVisibleAlerts(severity)) {
//       if(alert.active) {
//         count++;
//       }
//     }

//     return count;
//   }

//   AddAlert(a: Alert) {
//     if(!a.resolved) {
//       this.map.set(a.alertID, a);
//     } else {
//       // if(this.map.get(a.alertID) != null) {
//         this.map.delete(a.alertID)
//       // }
//     }
//   }

//   AddAlerts(aList: Alert[]) {
//     for (let alert of aList) {
//       this.map.set(alert.alertID, alert);
//     }
//   }

//   SentIsZero(): boolean {
//     let zero = "0001-01-01T00:00:00.000Z";

//     return this.sentDate.toISOString() === zero;
//   }

//   ArriveIsZero(): boolean {
//     let zero = "0001-01-01T00:00:00.000Z";

//     return this.arriveDate.toISOString() === zero;
//   }
// }
