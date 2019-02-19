import { Component, OnInit } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { ActivatedRoute } from '@angular/router';
import { MonitoringService } from 'src/app/services/monitoring.service';
import { DataService } from 'src/app/services/data.service';
import { ModalService } from 'src/app/services/modal.service';
import { RoomIssue, Alert } from 'src/app/objects/alerts';
import { Device } from 'src/app/objects/database';

@Component({
  selector: 'summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {
  roomAlerts: RoomIssue;
  deviceList: Device[] = [];
  filteredDevices: Device[] = [];
  deviceSearch: string;
  roomID: string;

  alertsToResolve: Alert[] = [];
  responders: string[] = [];

  sentTime: string;
  arrivedTime: string;

  constructor(public text: StringsService, private route: ActivatedRoute, public monitor: MonitoringService, public data: DataService, public modal: ModalService) {
    this.route.params.subscribe(params => {
      this.roomID = params["roomID"]
      

      // if(this.data.finished) {
      //   this.roomAlerts = this.monitor.roomAlertsMap.get(this.roomID)
      //   this.deviceList = this.data.roomToDevicesMap.get(this.roomID)
      //   this.filteredDevices = this.deviceList;
      //   this.SetResponders();
      // } else {
      //   this.data.loaded.subscribe(() => {
      //     this.roomAlerts = this.monitor.roomAlertsMap.get(this.roomID)
      //     this.deviceList = this.data.roomToDevicesMap.get(this.roomID)
      //     this.filteredDevices = this.deviceList;
      //     this.SetResponders();
      //   })
      // }
      
    })
  }

  ngOnInit() {
  }

  SearchDevices() {
    this.filteredDevices = [];

    if(this.deviceSearch == null || this.deviceSearch.length == 0) {
      this.filteredDevices = this.deviceList;
      return;
    }

    this.deviceList.forEach(device => {
      if(device.name.toLowerCase().includes(this.deviceSearch.toLowerCase()) && !this.filteredDevices.includes(device)) {
        this.filteredDevices.push(device);
      }

      if(device.displayName.toLowerCase().includes(this.deviceSearch.toLowerCase()) && !this.filteredDevices.includes(device)) {
        this.filteredDevices.push(device);
      }

      if(device.type.id.toLowerCase().includes(this.deviceSearch.toLowerCase()) && !this.filteredDevices.includes(device)) {
        this.filteredDevices.push(device);
      }

      device.roles.forEach(role => {
        if(role.id.toLowerCase().includes(this.deviceSearch.toLowerCase()) && !this.filteredDevices.includes(device)) {
          this.filteredDevices.push(device);
        }
      });

      if(device.tags != null) {
        device.tags.forEach(tag => {
          if(tag.toLowerCase().includes(this.deviceSearch.toLowerCase()) && !this.filteredDevices.includes(device)) {
            this.filteredDevices.push(device);
          }
        });
      }
    });
  }

  GoBack() {
    window.history.back();
  }

  GetRoomAlerts() {
    if(this.roomAlerts == null) {
      return null
    }

    return this.roomAlerts
  }

  HelpWasSent() {
    console.log(this.sentTime)
    let d = new Date()
    console.log(d.toLocaleString())

    let fullDate = new Date().toLocaleString()
    let today = fullDate.substr(0, fullDate.indexOf(","))

    let time = this.to24Hour(this.sentTime)
    let timestamp = today + ", " + time
    this.roomAlerts.helpSentAt = new Date(timestamp)
    console.log(this.roomAlerts.helpSentAt.toLocaleString())
  }

  HelpHasArrived() {
    console.log(this.arrivedTime)
    let d = new Date()
    console.log(d.toLocaleString())

    let fullDate = new Date().toLocaleString()
    let today = fullDate.substr(0, fullDate.indexOf(","))

    let time = this.to24Hour(this.arrivedTime)
    let timestamp = today + ", " + time
    this.roomAlerts.helpArrivedAt = new Date(timestamp)
    console.log(this.roomAlerts.helpArrivedAt.toLocaleString())
  }

  private to24Hour(time: string): string {
    let hours = time.split(":")[0]
    let mins = time.split(":")[1]
    let period

    let hoursNum = +hours

    if(hoursNum < 12) {
      period = "AM"
    }
    else {
      period = "PM"
    }

    if(hoursNum > 12) {
      hoursNum = hoursNum-12  
      hours = String(hoursNum)
      if(hours.length == 1) {
        hours = "0"+hours
      }
    }

    return hours + ":" + mins + " " + period 
  }

  // SetResponders(changed?: boolean) {
  //   if(changed) {
  //     for(let alert of this.roomAlerts.GetAlerts()) {
  //       alert.responders = this.responders;
  //     }
  //   } else {
  //     this.responders = this.roomAlerts.GetAlerts()[0].responders;
  //   }
  // }
}
