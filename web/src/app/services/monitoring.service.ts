import { Injectable } from '@angular/core';
import { Alert, AlertRow } from '../objects';
import { StringsService } from './strings.service';

@Injectable({
  providedIn: 'root'
})
export class MonitoringService {
  alertMap: Map<string, Alert[]>;
  alertRowList: AlertRow[] = Array<AlertRow>();

  severityMap = {
    1 : "critical",
    2 : "warning",
    3 : "low"
  }

  constructor(private text: StringsService) {
    this.FillFakeModel();
  }

  FillFakeModel() {
    this.alertMap = new Map();

    let a1 = new Alert();
    a1.alertID = "derek1"
    a1.buildingID = "ITB"
    a1.roomID = "ITB-1101"
    a1.deviceID = "ITB-1101-CP1"
    a1.type = "system"
    a1.severity = 1
    a1.message = "Heartbeat lost"
    a1.countBeforeResolution = 20
    a1.alertTags = ["heartbeat", "auto-generated"]
    a1.roomTags = ["development"]
    a1.deviceTags = ["pi"]
    a1.incidentID = "INC8675309"
    a1.helpSentAt = new Date()
    a1.helpArrivedAt = new Date()

    let a2 = new Alert();
    a2.alertID = "derek2"
    a2.buildingID = "ITB"
    a2.roomID = "ITB-1101"
    a2.deviceID = "ITB-1101-D1"
    a2.type = "user"
    a2.severity = 1
    a2.message = "Gave up and died"
    a2.countBeforeResolution = 1
    a2.alertTags = ["heartbeat", "auto-generated"]
    a2.roomTags = ["development"]
    a2.deviceTags = ["projector"]
    a2.incidentID = "INC8675309"
    a2.helpSentAt = new Date()
    a2.helpArrivedAt = new Date()

    let a3 = new Alert();
    a3.alertID = "derek3"
    a3.buildingID = "ITB"
    a3.roomID = "ITB-1101"
    a3.deviceID = "ITB-1101-VIA1"
    a3.type = "system"
    a3.severity = 2
    a3.message = "Acted like a jerk"
    a3.countBeforeResolution = 4
    a3.alertTags = ["user-generated"]
    a3.roomTags = ["development"]
    a3.deviceTags = ["via", "jerk"]
    a3.incidentID = "INC8675309"
    a3.helpSentAt = new Date()
    a3.helpArrivedAt = new Date()

    this.alertMap.set("ITB-1101", [a1, a2, a3])

    let row1 = new AlertRow();
    row1.roomID = "ITB-1101"
    row1.alerts.push(a1, a2, a3)
    row1.systemTypeIcon = "video_label"
    row1.incidentID = "INC8675309"

    this.alertRowList.push(row1)

    let a4 = new Alert();
    a4.alertID = "derek4"
    a4.buildingID = "HCEB"
    a4.roomID = "HCEB-401"
    a4.deviceID = "HCEB-401-CP1"
    a4.type = "system"
    a4.severity = 1
    a4.message = "Heartbeat lost"
    a4.countBeforeResolution = 20
    a4.alertTags = ["heartbeat", "auto-generated"]
    a4.roomTags = ["development"]
    a4.deviceTags = ["pi"]
    a4.incidentID = "INC0152668"
    a4.helpSentAt = new Date()
    a4.helpArrivedAt = new Date()

    let a5 = new Alert();
    a5.alertID = "derek5"
    a5.buildingID = "HCEB"
    a5.roomID = "HCEB-401"
    a5.deviceID = "HCEB-401-D2"
    a5.type = "user"
    a5.severity = 1
    a5.message = "Gave up and died"
    a5.countBeforeResolution = 3
    a5.alertTags = ["heartbeat", "auto-generated"]
    a5.roomTags = ["development"]
    a5.deviceTags = ["tv"]
    a5.incidentID = "INC0152668"
    a5.helpSentAt = new Date()
    a5.helpArrivedAt = new Date()

    let a6 = new Alert();
    a6.alertID = "derek6"
    a6.buildingID = "HCEB"
    a6.roomID = "HCEB-401"
    a6.deviceID = "HCEB-401-MIC1"
    a6.type = "auto"
    a6.severity = 3
    a6.message = "Battery low"
    a6.countBeforeResolution = 16
    a6.alertTags = ["auto-generated"]
    a6.roomTags = ["development"]
    a6.deviceTags = ["mic"]
    a6.incidentID = "INC0152668"
    a6.helpSentAt = new Date()
    a6.helpArrivedAt = new Date()

    this.alertMap.set("HCEB-401", [a4, a5, a6])

    let row2 = new AlertRow();
    row2.roomID = "HCEB-401"
    row2.alerts.push(a4, a5, a6)
    row2.systemTypeIcon = "accessible_forward"
    row2.incidentID = "INC0152668"

    this.alertRowList.push(row2)
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
}
