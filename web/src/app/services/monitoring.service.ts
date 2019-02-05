import { Injectable, EventEmitter } from '@angular/core';
import { Alert, AlertRow } from '../objects';
import { StringsService } from './strings.service';

@Injectable({
  providedIn: 'root'
})
export class MonitoringService {
  CRITICAL = "critical";
  WARNING = "warning";
  LOW = "low";

  alertMap: Map<string, Alert[]>;
  alertRowList: AlertRow[] = Array<AlertRow>();

  severityMap = {
    1 : "critical",
    2 : "warning",
    3 : "low"
  }

  settingsChanged: EventEmitter<any>;
  panelCount = 1;

  constructor(private text: StringsService) {
    this.FillFakeModel();
    this.settingsChanged = new EventEmitter<any>();
  }

  FillFakeModel() {
    this.alertMap = new Map();

    let now = new Date();

    let a1 = new Alert();
    a1.alertID = "derek1"
    a1.buildingID = "ITB"
    a1.roomID = "ITB-1101"
    a1.deviceID = "ITB-1101-CP1"
    a1.type = "system"
    a1.severity = "critical"
    a1.message = "Heartbeat lost"
    a1.alertTags = ["heartbeat", "auto-generated"]
    a1.roomTags = ["development"]
    a1.deviceTags = ["pi"]
    a1.incidentID = "INC8675309"
    a1.helpSentAt = new Date(now.toLocaleString());
    a1.helpArrivedAt = new Date(now.toLocaleString());

    let a2 = new Alert();
    a2.alertID = "derek2"
    a2.buildingID = "ITB"
    a2.roomID = "ITB-1101"
    a2.deviceID = "ITB-1101-D1"
    a2.type = "user"
    a2.severity = "critical"
    a2.message = "Gave up and died"
    a2.alertTags = ["heartbeat", "auto-generated"]
    a2.roomTags = ["development"]
    a2.deviceTags = ["projector"]
    a2.incidentID = "INC8675309"
    a2.helpSentAt = new Date(now.toLocaleString());
    a2.helpArrivedAt = new Date(now.toLocaleString());

    let a3 = new Alert();
    a3.alertID = "derek3"
    a3.buildingID = "ITB"
    a3.roomID = "ITB-1101"
    a3.deviceID = "ITB-1101-VIA1"
    a3.type = "system"
    a3.severity = "warning"
    a3.message = "Acted like a jerk"
    a3.alertTags = ["user-generated"]
    a3.roomTags = ["development"]
    a3.deviceTags = ["via", "jerk"]
    a3.incidentID = "INC0430573"
    a3.helpSentAt = new Date(now.toLocaleString());
    a3.helpArrivedAt = new Date(now.toLocaleString());

    this.alertMap.set("ITB-1101", [a1, a2, a3])

    let row1 = new AlertRow();
    row1.roomID = "ITB-1101"
    row1.alerts.push(a1, a2, a3)
    row1.systemTypeIcon = "video_label"
    row1.incidentID = "INC0430573"

    this.alertRowList.push(row1)

    let a4 = new Alert();
    a4.alertID = "derek4"
    a4.buildingID = "HCEB"
    a4.roomID = "HCEB-401"
    a4.deviceID = "HCEB-401-CP1"
    a4.type = "system"
    a4.severity = "critical"
    a4.message = "Heartbeat lost"
    a4.alertTags = ["heartbeat", "auto-generated"]
    a4.roomTags = ["development"]
    a4.deviceTags = ["pi"]
    a4.incidentID = "INC0152668"
    a4.helpSentAt = new Date(now.toLocaleString());
    a4.helpArrivedAt = new Date(now.toLocaleString());

    let a5 = new Alert();
    a5.alertID = "derek5"
    a5.buildingID = "HCEB"
    a5.roomID = "HCEB-401"
    a5.deviceID = "HCEB-401-D2"
    a5.type = "user"
    a5.severity = "critical"
    a5.message = "Gave up and died"
    a5.alertTags = ["heartbeat", "auto-generated"]
    a5.roomTags = ["development"]
    a5.deviceTags = ["tv"]
    a5.incidentID = "INC0152668"
    a5.helpSentAt = new Date(now.toLocaleString());
    a5.helpArrivedAt = new Date(now.toLocaleString());

    let a6 = new Alert();
    a6.alertID = "derek6"
    a6.buildingID = "HCEB"
    a6.roomID = "HCEB-401"
    a6.deviceID = "HCEB-401-MIC1"
    a6.type = "auto"
    a6.severity = "low"
    a6.message = "Battery low"
    a6.alertTags = ["auto-generated"]
    a6.roomTags = ["development"]
    a6.deviceTags = ["mic"]
    a6.incidentID = "INC0152668"
    a6.helpSentAt = new Date(now.toLocaleString());
    a6.helpArrivedAt = new Date(now.toLocaleString());

    this.alertMap.set("HCEB-401", [a4, a5, a6])

    let row2 = new AlertRow();
    row2.roomID = "HCEB-401"
    row2.alerts.push(a4, a5, a6)
    row2.systemTypeIcon = "accessible_forward"
    row2.incidentID = "INC0152668"

    this.alertRowList.push(row2)

    let a7 = new Alert();
    a7.alertID = "derek7"
    a7.buildingID = "JFSB"
    a7.roomID = "JFSB-B1081"
    a7.deviceID = "JFSB-B1081-CP1"
    a7.type = "system"
    a7.severity = "critical"
    a7.message = "Heartbeat lost"
    a7.alertTags = ["heartbeat", "auto-generated"]
    a7.roomTags = ["development"]
    a7.deviceTags = ["pi"]
    a7.incidentID = "INC8675309"
    a7.helpSentAt = new Date(now.toLocaleString());
    a7.helpArrivedAt = new Date(now.toLocaleString());

    this.alertMap.set("JFSB-B1081", [a7])

    let row3 = new AlertRow();
    row3.roomID = "JFSB-B1081"
    row3.alerts.push(a7)
    row3.systemTypeIcon = "video_label"
    row3.incidentID = "INC0430573"

    this.alertRowList.push(row3)

    let a8 = new Alert();
    a8.alertID = "derek8"
    a8.buildingID = "HFAC"
    a8.roomID = "HFAC-D400"
    a8.deviceID = "HFAC-D400-D1"
    a8.type = "user"
    a8.severity = "critical"
    a8.message = "Gave up and died"
    a8.alertTags = ["heartbeat", "auto-generated"]
    a8.roomTags = ["development"]
    a8.deviceTags = ["projector"]
    a8.incidentID = "INC8675309"
    a8.helpSentAt = new Date(now.toLocaleString());
    a8.helpArrivedAt = new Date(now.toLocaleString());

    let a9 = new Alert();
    a9.alertID = "derek9"
    a9.buildingID = "HFAC"
    a9.roomID = "HFAC-D400"
    a9.deviceID = "HFAC-D400-VIA1"
    a9.type = "system"
    a9.severity = "warning"
    a9.message = "Acted like a jerk"
    a9.alertTags = ["user-generated"]
    a9.roomTags = ["development"]
    a9.deviceTags = ["via", "jerk"]
    a9.incidentID = "INC0430573"
    a9.helpSentAt = new Date(now.toLocaleString());
    a9.helpArrivedAt = new Date(now.toLocaleString());

    this.alertMap.set("HFAC-D400", [a8, a9]);

    let row4 = new AlertRow();
    row4.roomID = "HFAC-D400"
    row4.alerts.push(a7)
    row4.systemTypeIcon = "video_label"
    row4.incidentID = "INC0430573"

    this.alertRowList.push(row4)

    let a10 = new Alert();
    a10.alertID = "derek10"
    a10.buildingID = "EB"
    a10.roomID = "EB-438"
    a10.deviceID = "EB-438-CP1"
    a10.type = "system"
    a10.severity = "critical"
    a10.message = "Heartbeat lost"
    a10.alertTags = ["heartbeat", "auto-generated"]
    a10.roomTags = ["development"]
    a10.deviceTags = ["pi"]
    a10.incidentID = "INC0152668"
    a10.helpSentAt = new Date(now.toLocaleString());
    a10.helpArrivedAt = new Date(now.toLocaleString());

    let a11 = new Alert();
    a11.alertID = "derek11"
    a11.buildingID = "EB"
    a11.roomID = "EB-438"
    a11.deviceID = "HCEB-401-D2"
    a11.type = "user"
    a11.severity = "critical"
    a11.message = "Gave up and died"
    a11.alertTags = ["heartbeat", "auto-generated"]
    a11.roomTags = ["development"]
    a11.deviceTags = ["tv"]
    a11.incidentID = "INC0152668"
    a11.helpSentAt = new Date(now.toLocaleString());
    a11.helpArrivedAt = new Date(now.toLocaleString());

    let a12 = new Alert();
    a12.alertID = "derek12"
    a12.buildingID = "EB"
    a12.roomID = "EB-438"
    a12.deviceID = "EB-438-MIC1"
    a12.type = "auto"
    a12.severity = "low"
    a12.message = "Battery low"
    a12.alertTags = ["auto-generated"]
    a12.roomTags = ["development"]
    a12.deviceTags = ["mic"]
    a12.incidentID = "INC0152668"
    a12.helpSentAt = new Date(now.toLocaleString());
    a12.helpArrivedAt = new Date(now.toLocaleString());

    let a13 = new Alert();
    a13.alertID = "derek13"
    a13.buildingID = "ITB"
    a13.roomID = "EB-438"
    a13.deviceID = "EB-438-CP2"
    a13.type = "system"
    a13.severity = "critical"
    a13.message = "Heartbeat lost"
    a13.alertTags = ["heartbeat", "auto-generated"]
    a13.roomTags = ["development"]
    a13.deviceTags = ["pi"]
    a13.incidentID = "INC8675309"
    a13.helpSentAt = new Date(now.toLocaleString());
    a13.helpArrivedAt = new Date(now.toLocaleString());

    let a14 = new Alert();
    a14.alertID = "derek14"
    a14.buildingID = "ITB"
    a14.roomID = "EB-438"
    a14.deviceID = "EB-438-D2"
    a14.type = "user"
    a14.severity = "critical"
    a14.message = "Gave up and died"
    a14.alertTags = ["heartbeat", "auto-generated"]
    a14.roomTags = ["development"]
    a14.deviceTags = ["projector"]
    a14.incidentID = "INC8675309"
    a14.helpSentAt = new Date(now.toLocaleString());
    a14.helpArrivedAt = new Date(now.toLocaleString());

    this.alertMap.set("EB-438", [a10, a11, a12, a13, a14])

    let row5 = new AlertRow();
    row5.roomID = "EB-438"
    row5.alerts.push(a10, a11, a12, a13, a14)
    row5.systemTypeIcon = "accessible_forward"
    row5.incidentID = "INC0152668"

    this.alertRowList.push(row5)

    let a15 = new Alert();
    a15.alertID = "derek15"
    a15.buildingID = "ASB"
    a15.roomID = "ASB-A343"
    a15.deviceID = "ASB-A343-VIA1"
    a15.type = "system"
    a15.severity = "warning"
    a15.message = "Acted like a jerk"
    a15.alertTags = ["user-generated"]
    a15.roomTags = ["development"]
    a15.deviceTags = ["via", "jerk"]
    a15.incidentID = "INC0430573"
    a15.helpSentAt = new Date(now.toLocaleString());
    a15.helpArrivedAt = new Date(now.toLocaleString());

    let a16 = new Alert();
    a16.alertID = "derek16"
    a16.buildingID = "ASB"
    a16.roomID = "ASB-A343"
    a16.deviceID = "ASB-A343-CP1"
    a16.type = "system"
    a16.severity = "critical"
    a16.message = "Heartbeat lost"
    a16.alertTags = ["heartbeat", "auto-generated"]
    a16.roomTags = ["development"]
    a16.deviceTags = ["pi"]
    a16.incidentID = "INC0152668"
    a16.helpSentAt = new Date(now.toLocaleString());
    a16.helpArrivedAt = new Date(now.toLocaleString());

    let a17 = new Alert();
    a17.alertID = "derek17"
    a17.buildingID = "ASB"
    a17.roomID = "ASB-A343"
    a17.deviceID = "ASB-A343-D2"
    a17.type = "user"
    a17.severity = "critical"
    a17.message = "Gave up and died"
    a17.alertTags = ["heartbeat", "auto-generated"]
    a17.roomTags = ["development"]
    a17.deviceTags = ["tv"]
    a17.incidentID = "INC0152668"
    a17.helpSentAt = new Date(now.toLocaleString());
    a17.helpArrivedAt = new Date(now.toLocaleString());

    let a18 = new Alert();
    a18.alertID = "derek18"
    a18.buildingID = "ASB"
    a18.roomID = "ASB-A343"
    a18.deviceID = "ASB-A343-MIC1"
    a18.type = "auto"
    a18.severity = "low"
    a18.message = "Battery low"
    a18.alertTags = ["auto-generated"]
    a18.roomTags = ["development"]
    a18.deviceTags = ["mic"]
    a18.incidentID = "INC0152668"
    a18.helpSentAt = new Date(now.toLocaleString());
    a18.helpArrivedAt = new Date(now.toLocaleString());

    this.alertMap.set("ASB-A343", [a15, a16, a17, a18])

    let row6 = new AlertRow();
    row6.roomID = "ASB-A343"
    row6.alerts.push(a15, a16, a17, a18)
    row6.systemTypeIcon = "accessible_forward"
    row6.incidentID = "INC0152668"

    this.alertRowList.push(row6)
  }

  GetAlertTypes(alerts: Alert[]): string[] {
    let toReturn: string[] = [];

    alerts.forEach(a => {
      if (!toReturn.includes(this.text.Title(a.type))) {
        toReturn.push(this.text.Title(a.type));
      }
    });

    return toReturn;
  }

  GetAllAlerts(): AlertRow[] {
    return this.alertRowList;
  }

  GetCriticalAlerts(): AlertRow[] {
    let toReturn: AlertRow[] = [];

    for(let row of this.alertRowList) {
      let tempAlerts: Alert[] = [];
      
      for(let alert of row.alerts) {
        if(alert.severity === this.CRITICAL) {
          tempAlerts.push(alert);
        }
      }

      if(tempAlerts.length > 0) {
        let newRow: AlertRow = {...row}

        newRow.alerts = tempAlerts;

        toReturn.push(newRow);
      }
    }

    return toReturn;
  }

  GetWarningAlerts(): AlertRow[] {
    let toReturn: AlertRow[] = [];

    for(let row of this.alertRowList) {
      let tempAlerts: Alert[] = [];
      
      for(let alert of row.alerts) {
        if(alert.severity === this.WARNING) {
          tempAlerts.push(alert);
        }
      }

      if(tempAlerts.length > 0) {
        let newRow: AlertRow = {...row}

        newRow.alerts = tempAlerts;

        toReturn.push(newRow);
      }
    }

    return toReturn;
  }

  GetLowAlerts(): AlertRow[] {
    let toReturn: AlertRow[] = [];

    for(let row of this.alertRowList) {
      let tempAlerts: Alert[] = [];
      
      for(let alert of row.alerts) {
        if(alert.severity === this.LOW) {
          tempAlerts.push(alert);
        }
      }

      if(tempAlerts.length > 0) {
        let newRow: AlertRow = {...row}

        newRow.alerts = tempAlerts;

        toReturn.push(newRow);
      }
    }

    return toReturn;
  }
}
