import { Component, OnInit, ViewChild } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { ActivatedRoute } from '@angular/router';
import { MonitoringService } from 'src/app/services/monitoring.service';
import { DataService } from 'src/app/services/data.service';
import { ModalService } from 'src/app/services/modal.service';
import { RoomIssue, Alert } from 'src/app/objects/alerts';
import { Device } from 'src/app/objects/database';
import { AlertTableComponent } from '../../dashboard/alerttable/alerttable.component';
import { APIService } from 'src/app/services/api.service';

@Component({
  selector: 'summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {
  roomIssue: RoomIssue;
  deviceList: Device[] = [];
  filteredDevices: Device[];
  deviceSearch: string;
  roomID: string;

  alertsToResolve: Alert[] = [];
  responders: string = "";

  sentTime: string;
  arrivedTime: string;

  @ViewChild(AlertTableComponent) table: AlertTableComponent;

  constructor(public text: StringsService, private route: ActivatedRoute, public data: DataService, public modal: ModalService, private api: APIService) {
    this.route.params.subscribe(params => {
      this.roomID = params["roomID"]
      

      if(this.data.finished) {
        this.roomIssue = this.data.GetRoomIssue(this.roomID)
        this.deviceList = this.data.roomToDevicesMap.get(this.roomID)
        this.filteredDevices = this.deviceList;
        if(this.roomIssue.responders != null) {
          this.responders = this.roomIssue.responders.toString()
        }
        this.SetTimes();
        
      } else {
        this.data.loaded.subscribe(() => {
          this.roomIssue = this.data.GetRoomIssue(this.roomID)
          this.deviceList = this.data.roomToDevicesMap.get(this.roomID)
          this.filteredDevices = this.deviceList;

          if(this.roomIssue.responders != null) {
            this.responders = this.roomIssue.responders.toString()
          }
          
          this.SetTimes();
          
        })
      }
      
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
    if(this.roomIssue == null) {
      return null
    }

    return this.roomIssue
  }

  SetTimes() {
    if(this.roomIssue != null) {
      if(!this.roomIssue.SentIsZero()) {
        let time = this.roomIssue.helpSentAt.toTimeString();
        this.sentTime = time.substring(0, time.lastIndexOf(":"));
      } else {
        let time = new Date().toTimeString();
        this.sentTime = time.substring(0, time.lastIndexOf(":"));
      }
      if(!this.roomIssue.ArrivedIsZero()) {
        let time = this.roomIssue.helpArrivedAt.toTimeString();
        this.arrivedTime = time.substring(0, time.lastIndexOf(":"));
      }
      else {
        let time = new Date().toTimeString();
        this.arrivedTime = time.substring(0, time.lastIndexOf(":"));
      }
    }
  }

  HelpWasSent() {
    console.log(this.sentTime)
    let d = new Date()
    console.log(d.toLocaleString())

    let fullDate = new Date().toLocaleString()
    let today = fullDate.substr(0, fullDate.indexOf(","))

    let time = this.to24Hour(this.sentTime)
    let timestamp = today + ", " + time
    this.roomIssue.helpSentAt = new Date(timestamp)
    console.log(this.roomIssue.helpSentAt.toLocaleString())
  }

  HelpHasArrived() {
    console.log(this.arrivedTime)
    let d = new Date()
    console.log(d.toLocaleString())

    let fullDate = new Date().toLocaleString()
    let today = fullDate.substr(0, fullDate.indexOf(","))

    let time = this.to24Hour(this.arrivedTime)
    let timestamp = today + ", " + time
    this.roomIssue.helpArrivedAt = new Date(timestamp)
    console.log(this.roomIssue.helpArrivedAt.toLocaleString())
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
  //     for(let alert of this.roomIssue.GetAlerts()) {
  //       alert.responders = this.responders;
  //     }
  //   } else {
  //     this.responders = this.roomIssue.GetAlerts()[0].responders;
  //   }
  // }

  UpdateIssue() {
    if(this.roomIssue.ResolvedAtIsZero()) {
      console.log("derek")
      this.roomIssue.resolutionInfo.resolvedAt = new Date("1970-01-01T00:00:00.000Z")
    }
    for(let alert of this.roomIssue.alerts) {
      alert.endTime = new Date("1970-01-01T00:00:00.000Z")
    }
    this.roomIssue.responders = [];
    let commaSep = this.responders.split(",")
    for(let s of commaSep) {
      this.roomIssue.responders.push(s.trim())
    }
    console.log(this.roomIssue);
    this.api.UpdateIssue(this.roomIssue);
  }
}
