import { Injectable, EventEmitter } from '@angular/core';
import { Alert, RoomAlerts } from '../objects';
import { StringsService } from './strings.service';
import { SocketService } from './socket.service';
import { APIService } from './api.service';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class MonitoringService {
  roomAlertsMap: Map<string, RoomAlerts> = new Map();
  roomAlertsList: RoomAlerts[] = [];
  settingsChanged: EventEmitter<any>;
  panelCount: number = 1;

  CRITICAL = "critical"
  WARNING = "warning"

  constructor(private text: StringsService, private socket: SocketService, private api: APIService, private data: DataService) {
    this.settingsChanged = new EventEmitter();
    this.RefreshAlerts();
    this.ListenForAlerts();
  }

  async RefreshAlerts() {
    await this.api.GetAllAlerts().then((alerts) => {
      for(let a of alerts) {
        if(this.roomAlertsMap.get(a.roomID) == null) {
          let room = this.data.GetRoom(a.roomID);
          let ra = new RoomAlerts(a.roomID, [a], (room.configuration.id === "DMPS"))
          this.roomAlertsMap.set(a.roomID, ra);
          this.roomAlertsList.push(ra);
        } else {
          this.roomAlertsMap.get(a.roomID).alerts.push(a);
        }
      }
    });
  }

  private ListenForAlerts() {
    this.socket.listener.subscribe(alert => {
      if(alert != null) {
        if(this.roomAlertsMap.get(alert.roomID) == null) {
          let room = this.data.GetRoom(alert.roomID);
          let ra = new RoomAlerts(alert.roomID, [alert], (room.configuration.id === "DMPS"))
          this.roomAlertsMap.set(alert.roomID, ra);
          this.roomAlertsList.push(ra);
        } else {
          this.roomAlertsMap.get(alert.roomID).alerts.push(alert);
        }
      }   
    });
  }

  GetAllAlerts(severity?: string) {
    if(severity == null || severity.length == 0) {
      return this.roomAlertsList;
    }
    
    let toReturn: RoomAlerts[] = [];

    for(let ra of this.roomAlertsList) {
      let matches = false
      
      for(let alert of ra.alerts) {
        if(alert.severity === severity) {
          matches = true
          break
        }
      }

      if(matches) {
        toReturn.push(ra);
      }
    }

    return toReturn;
  }
}
