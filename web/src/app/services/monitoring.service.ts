import { Injectable, EventEmitter } from '@angular/core';
import { Alert, RoomAlerts } from '../objects';
import { StringsService } from './strings.service';
import { SocketService } from './socket.service';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class MonitoringService {
  roomAlertsMap: Map<string, RoomAlerts> = new Map();
  settingsChanged: EventEmitter<any>;
  alertEmitter: EventEmitter<Alert>;
  panelCount: number = 1;

  CRITICAL = "critical"
  WARNING = "warning"

  constructor(private text: StringsService, private socket: SocketService, private data: DataService) {
    this.settingsChanged = new EventEmitter();
    this.alertEmitter = new EventEmitter();
    if(this.data.finished) {
      console.log("doing 1")
      this.RefreshAlerts();
    } else {
      this.data.loaded.subscribe(event => {
        if(event == true) {
          console.log("doing 2")

          this.RefreshAlerts();
        }
        
      })
    }
    
    this.ListenForAlerts();
  }

  async RefreshAlerts() {
    console.log(this.data.storedAlertList)
      for(let a of this.data.storedAlertList) {
        if(this.roomAlertsMap.get(a.roomID) == null) {
          let ra = new RoomAlerts(a.roomID, [a])
          this.roomAlertsMap.set(a.roomID, ra);
        } else {
          this.roomAlertsMap.get(a.roomID).AddAlert(a);
        }
      }
  }

  

  private ListenForAlerts() {
    this.socket.listener.subscribe(alert => {
      if(alert != null) {
        if(this.roomAlertsMap.get(alert.roomID) == null) {
          let ra = new RoomAlerts(alert.roomID, [alert])
          this.roomAlertsMap.set(alert.roomID, ra);
        } else {
          this.roomAlertsMap.get(alert.roomID).AddAlert(alert);
        }

        this.alertEmitter.emit(alert);
      }   
    });
  }

  GetAllAlerts(severity?: string) {
    let toReturn: RoomAlerts[] = [];

    if(severity == null || severity.length == 0) {
      this.roomAlertsMap.forEach((value, key) => {
        toReturn.push(value)    
      })
      return toReturn.sort((a, b):number => {
        return a!.roomID!.localeCompare(b!.roomID);
      });
    }
    
    this.roomAlertsMap.forEach((value, key) => {
      let matches = false
      
      for(let alert of value.GetAlerts()) {
        if(alert.severity === severity) {
          matches = true
          break
        }
      }

      if(matches) {
        toReturn.push(value);
      }
    });

    return toReturn.sort((a, b):number => {
      return a!.roomID!.localeCompare(b.roomID);
    });
  }
}
