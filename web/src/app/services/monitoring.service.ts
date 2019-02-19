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

  totalAlertsCount = 0;

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
    // console.log(this.data.storedAlertList)
    if(this.data.storedAlertList) {
      for(let a of this.data.storedAlertList) {
        if(this.roomAlertsMap.get(a.roomID) == null) {
          let ra = new RoomAlerts(a.roomID, [a])
          this.roomAlertsMap.set(a.roomID, ra);
        } else {
          this.roomAlertsMap.get(a.roomID).AddAlert(a);
        }
      }
      this.GetTotalAlertsDisplay()
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

    if(severity == null || severity.length == 0 || severity === "all-alerts") {
      this.roomAlertsMap.forEach((value, key) => {
        if(value.GetVisibleAlerts(severity).length > 0) {
          toReturn.push(value)
        }
      })

      console.log(toReturn);
      // this.GetTotalAlertsDisplay(severity)
      return toReturn.sort(this.RoomAlertSort);
    }
    
    this.roomAlertsMap.forEach((value, key) => {
      if(value.GetVisibleAlerts(severity).length != 0) {
        let matches = false
      
        for(let alert of value.GetVisibleAlerts()) {
          if(alert.severity.toLowerCase() === severity.toLowerCase()) {
            matches = true
            break
          }
        }
  
        if(matches) {
          toReturn.push(value);
        }
      }
    });

    // this.GetTotalAlertsDisplay(severity)
    return toReturn.sort(this.RoomAlertSort);
  }

  private RoomAlertSort(a, b): number {
    if(a.roomID == null && b.roomID != null) {return 1}
    if(b.roomID == null && a.roomID != null) {return -1}
    return a!.roomID!.localeCompare(b.roomID);
  }

  GetTotalAlertsDisplay(panelType?: string) {
    if(panelType != null && panelType != "battery") {
      this.totalAlertsCount = 0
      for(let ra of this.GetAllAlerts(panelType)) {
        this.totalAlertsCount += ra.GetVisibleAlerts(panelType).length
      }
      return this.totalAlertsCount
    }
  }
}
