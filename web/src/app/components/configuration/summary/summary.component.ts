import { Component, OnInit, ViewChild } from "@angular/core";
import { StringsService } from "src/app/services/strings.service";
import { ActivatedRoute } from "@angular/router";
import { DataService } from "src/app/services/data.service";
import { ModalService } from "src/app/services/modal.service";
import { RoomIssue, Alert } from "src/app/objects/alerts";
import { Device, Person } from "src/app/objects/database";
import { AlertTableComponent } from "../../dashboard/alerttable/alerttable.component";
import { APIService } from "src/app/services/api.service";

@Component({
  selector: "app-summary",
  templateUrl: "./summary.component.html",
  styleUrls: ["./summary.component.scss"]
})
export class SummaryComponent implements OnInit {
  roomIssue: RoomIssue;
  roomIssues: RoomIssue[];
  deviceList: Device[] = [];
  filteredDevices: Device[];
  responders: Person[] = [];
  deviceSearch: string;
  roomID: string;

  alertsToResolve: Alert[] = [];

  sentTime: string;
  arrivedTime: string;

  @ViewChild(AlertTableComponent) table: AlertTableComponent;

  constructor(public text: StringsService,
    private route: ActivatedRoute,
    public data: DataService,
    public modal: ModalService,
    private api: APIService) {
    this.route.params.subscribe(params => {
      this.roomID = params["roomID"];


      if (this.data.finished) {
        this.roomIssues = this.data.GetRoomIssues(this.roomID);
        this.deviceList = this.data.roomToDevicesMap.get(this.roomID);
        this.filteredDevices = this.deviceList;

        if (this.roomIssues != null) {
          for (const issue of this.roomIssues) {
            if (issue.responders != null) {
              for (const r of issue.responders) {
                if (!this.responders.includes(r)) {
                  this.responders.push(r);
                }
              }
            }
          }
        }

        this.SetTimes();

      } else {
        this.data.loaded.subscribe(() => {
          this.roomIssues = this.data.GetRoomIssues(this.roomID);
          this.deviceList = this.data.roomToDevicesMap.get(this.roomID);
          this.filteredDevices = this.deviceList;
          if (this.roomIssues != null) {
            for (const issue of this.roomIssues) {
              if (issue.responders != null) {
                for (const r of issue.responders) {
                  if (!this.responders.includes(r)) {
                    this.responders.concat(r);
                  }
                }
              }
            }
          }

          this.SetTimes();

        });
      }

    });
  }

  ngOnInit() {
  }

  SearchDevices() {
    this.filteredDevices = [];

    if (this.deviceSearch == null || this.deviceSearch.length === 0) {
      this.filteredDevices = this.deviceList;
      return;
    }

    this.deviceList.forEach(device => {
      if (device.name.toLowerCase().includes(this.deviceSearch.toLowerCase()) && !this.filteredDevices.includes(device)) {
        this.filteredDevices.push(device);
      }

      if (device.displayName.toLowerCase().includes(this.deviceSearch.toLowerCase()) && !this.filteredDevices.includes(device)) {
        this.filteredDevices.push(device);
      }

      if (device.type.id.toLowerCase().includes(this.deviceSearch.toLowerCase()) && !this.filteredDevices.includes(device)) {
        this.filteredDevices.push(device);
      }

      device.roles.forEach(role => {
        if (role.id.toLowerCase().includes(this.deviceSearch.toLowerCase()) && !this.filteredDevices.includes(device)) {
          this.filteredDevices.push(device);
        }
      });

      if (device.tags != null) {
        device.tags.forEach(tag => {
          if (tag.toLowerCase().includes(this.deviceSearch.toLowerCase()) && !this.filteredDevices.includes(device)) {
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
    if (this.roomIssues == null) {
      return null;
    }
    return this.roomIssues;
  }

  SetTimes() {
    if (this.roomIssues != null) {
      for (const issue of this.roomIssues) {
        this.roomIssue = issue;
        if (!issue.SentIsZero()) {
          const time = issue.helpSentAt.toTimeString();
          this.sentTime = time.substring(0, time.lastIndexOf(":"));
        } else {
          const time = new Date().toTimeString();
          this.sentTime = time.substring(0, time.lastIndexOf(":"));
        }
        if (!issue.ArrivedIsZero()) {
          const time = issue.helpArrivedAt.toTimeString();
          this.arrivedTime = time.substring(0, time.lastIndexOf(":"));
        } else {
          const time = new Date().toTimeString();
          this.arrivedTime = time.substring(0, time.lastIndexOf(":"));
        }
      }

    }
  }

  HelpWasSent() {
    const fullDate = new Date().toLocaleString();
    const today = fullDate.substr(0, fullDate.indexOf(","));

    const time = this.to24Hour(this.sentTime);
    const timestamp = today + ", " + time;
    for (const issue of this.roomIssues) {
      issue.helpSentAt = new Date(timestamp);
    }
  }

  HelpHasArrived() {
    const fullDate = new Date().toLocaleString();
    const today = fullDate.substr(0, fullDate.indexOf(","));

    const time = this.to24Hour(this.arrivedTime);
    const timestamp = today + ", " + time;
    for (const issue of this.roomIssues) {
      issue.helpArrivedAt = new Date(timestamp);
    }
  }

  private to24Hour(time: string): string {
    let hours = time.split(":")[0];
    const mins = time.split(":")[1];
    let period;

    let hoursNum = +hours;

    if (hoursNum < 12) {
      period = "AM";
    } else {
      period = "PM";
    }

    if (hoursNum > 12) {
      hoursNum = hoursNum - 12;
      hours = String(hoursNum);
      if (hours.length === 1) {
        hours = "0" + hours;
      }
    }

    return hours + ":" + mins + " " + period;
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

  UpdateIssue(issue: RoomIssue) {
    if (issue.ResolvedAtIsZero()) {
      issue.resolutionInfo.resolvedAt = new Date("1970-01-01T00:00:00.000Z");
    }
    for (const alert of issue.alerts) {
      alert.endTime = new Date("1970-01-01T00:00:00.000Z");
    }
    issue.responders = [];
    for (const r of this.responders) {
      issue.responders.push(r);
    }
    console.log(issue);
    this.api.UpdateIssue(issue);
  }
}
