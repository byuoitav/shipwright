import { Component, OnInit, ViewChild } from "@angular/core";
import { StringsService } from "src/app/services/strings.service";
import { ActivatedRoute, Router } from "@angular/router";
import { DataService } from "src/app/services/data.service";
import { ModalService } from "src/app/services/modal.service";
import {
  RoomIssue,
  ResolutionInfo,
  ClassSchedule
} from "src/app/objects/alerts";
import { Device, Person } from "src/app/objects/database";
import { RoomIssueResponse } from "src/app/objects/alerts";
import { AlertTableComponent } from "../../../dashboard/alerttable/alerttable.component";
import { APIService } from "src/app/services/api.service";
import { MatDialog, MatTableDataSource } from "@angular/material";
import { ResolveModalComponent } from "../../../../modals/resolve/resolve.component";
import { ResponseModalComponent } from "../../../../modals/responsemodal/responsemodal.component";

@Component({
  selector: "alerts",
  templateUrl: "./alerts.component.html",
  styleUrls: ["./alerts.component.scss"]
})
export class AlertsComponent implements OnInit {
  roomIssue: RoomIssue;
  deviceList: Device[] = [];
  filteredDevices: Device[];
  filteredResponders: Person[];
  responders: Person[] = [];
  deviceSearch: string;
  responderSearch: string;
  roomID: string;

  tempNotes: string;

  sentTime: string;
  arrivedTime: string;

  classSchedule: ClassSchedule[] = [];
  scheduleData: MatTableDataSource<ClassSchedule>;
  scheduleColumns: string[] = [
    "block",
    "className",
    "classTime",
    "teacher",
    "days"
  ];

  responseData: MatTableDataSource<RoomIssueResponse>;
  responseColumns: string[] = ["sent", "arrived", "responders"];

  helpArrivedSent = false;
  helpArrivedError = false;
  helpArrivedSuccess = false;

  @ViewChild(AlertTableComponent) table: AlertTableComponent;

  constructor(
    public text: StringsService,
    private route: ActivatedRoute,
    private router: Router,
    public data: DataService,
    public modal: ModalService,
    private dialog: MatDialog,
    private api: APIService
  ) {
    this.route.params.subscribe(params => {
      this.roomID = params["roomID"];

      if (this.data.finished) {
        this.SetupSummary();
      } else {
        this.data.loaded.subscribe(() => {
          this.SetupSummary();
        });
      }
    });
  }

  ngOnInit() {}

  async SetupSummary() {
    this.deviceList = this.data.roomToDevicesMap.get(this.roomID);
    this.filteredDevices = this.deviceList;
    this.filteredResponders = this.data.possibleResponders;
    // await this.SetupSchedule();

    this.roomIssue = this.data.GetRoomIssue(this.roomID);
    if (this.roomIssue == null || this.roomIssue === undefined) {
      console.error("no room issue found for room", this.roomID);
      return;
    }

    if (this.roomIssue.roomIssueResponses == null) {
      this.roomIssue.roomIssueResponses = [];
    }

    this.responseData = new MatTableDataSource(
      this.roomIssue.roomIssueResponses
    );

    this.data.issueEmitter.subscribe(changedIssue => {
      if (
        changedIssue != null &&
        changedIssue !== undefined &&
        this.roomID === changedIssue.roomID
      ) {
        this.roomIssue = changedIssue;
        console.log("changed issue", changedIssue);

        if (changedIssue.resolved) {
          this.router.navigate(["/dashboard"], {
            queryParamsHandling: "merge"
          });
        }
      }
    });
  }

  async SetupSchedule() {
    // await this.api.GetClassSchedule(this.roomID).then(result => {
    //   this.classSchedule = result;
    //   this.scheduleData = new MatTableDataSource(this.classSchedule);
    // });
  }

  SearchDevices() {
    this.filteredDevices = [];

    if (this.deviceSearch == null || this.deviceSearch.length === 0) {
      this.filteredDevices = this.deviceList;
      return;
    }

    this.deviceList.forEach(device => {
      if (!this.filteredDevices.includes(device)) {
        if (
          device.name.toLowerCase().includes(this.deviceSearch.toLowerCase())
        ) {
          this.filteredDevices.push(device);
        }

        if (
          device.displayName
            .toLowerCase()
            .includes(this.deviceSearch.toLowerCase())
        ) {
          this.filteredDevices.push(device);
        }

        if (
          device.type.id.toLowerCase().includes(this.deviceSearch.toLowerCase())
        ) {
          this.filteredDevices.push(device);
        }

        device.roles.forEach(role => {
          if (role.id.toLowerCase().includes(this.deviceSearch.toLowerCase())) {
            this.filteredDevices.push(device);
          }
        });

        if (device.tags != null) {
          device.tags.forEach(tag => {
            if (tag.toLowerCase().includes(this.deviceSearch.toLowerCase())) {
              this.filteredDevices.push(device);
            }
          });
        }
      }
    });
  }

  GoBack() {
    window.history.back();
  }

  HelpWasSent() {
    const fullDate = new Date().toLocaleString();
    const today = fullDate.substr(0, fullDate.indexOf(","));

    const time = this.to24Hour(this.sentTime);
    const timestamp = today + ", " + time;
  }

  HelpHasArrived() {
    const fullDate = new Date().toLocaleString();
    const today = fullDate.substr(0, fullDate.indexOf(","));

    const time = this.to24Hour(this.arrivedTime);
    const timestamp = today + ", " + time;
  }

  to24Hour(time: string): string {
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

    if (hoursNum === 0) {
      hoursNum += 12;
      hours = String(hoursNum);
    }

    return hours + ":" + mins + " " + period;
  }

  UpdateIssue(issue: RoomIssue) {
    if (issue.ResolvedAtIsZero()) {
      // issue.resolutionInfo.resolvedAt = new Date("1970-01-01T00:00:00.000Z");
    }
    for (const alert of issue.alerts) {
      alert.endTime = new Date("1970-01-01T00:00:00.000Z");
    }
    this.api.UpdateIssue(issue);
  }

  AddNote() {
    if (this.roomIssue.notesLog == null) {
      this.roomIssue.notesLog = [];
    }

    if (!/\S/.test(this.tempNotes)) {
      console.log("there was nothing");
      return;
    } else {
      const now = new Date();
      this.roomIssue.notes =
        this.data.currentUsername +
        " (" +
        now.toLocaleString() +
        ") | " +
        this.tempNotes;
      // this.roomIssue.notesLog.push(noteToAdd);
      this.UpdateIssue(this.roomIssue);
      this.tempNotes = "";
    }
  }

  ExtractNoteInfo(note: string, beginning: boolean): string {
    if (beginning) {
      const prefix = note.substring(0, note.indexOf("|"));
      return prefix;
    } else {
      return note.substring(note.indexOf("|") + 1);
    }
  }

  RemoveResponder(responder: Person) {
    const index = this.responders.indexOf(responder);
    if (index >= 0) {
      this.responders.splice(index, 1);
    }
    return;
  }

  AddResponder(value: string, event?: any) {
    if (this.responders == null || this.responders.length === 0) {
      this.responders = [];
    }

    // Add our responder
    for (const person of this.data.possibleResponders) {
      if (person.name === value.trim() || person.id === value.trim()) {
        if (!this.responders.includes(person)) {
          this.responders.push(person);
        }
        break;
      }
    }
    this.responderSearch = "";
    if (event != null) {
      if (event.input != null) {
        if (event.input.value != null) {
          if (event.input.value.length > 0) {
            event.input.value = "";
            console.log("Input success!");
          }
        }
      }
      if (event.option != null) {
        if (event.option.value != null) {
          if (event.option.value.length > 0) {
            event.option.value = "";
            console.log("Option success!");
          }
        }
      }
    }
  }

  FilterResponders() {
    this.filteredResponders = [];
    if (this.responderSearch == null || this.responderSearch.length === 0) {
      this.filteredResponders = this.data.possibleResponders;
      return;
    }
    for (const person of this.data.possibleResponders) {
      if (
        person.id.toLowerCase().includes(this.responderSearch.toLowerCase()) &&
        !this.filteredResponders.includes(person)
      ) {
        this.filteredResponders.push(person);
      }
      if (
        person.name
          .toLowerCase()
          .includes(this.responderSearch.toLowerCase()) &&
        !this.filteredResponders.includes(person)
      ) {
        this.filteredResponders.push(person);
      }
    }
  }

  isResolvable() {
    if (!this.roomIssue || !this.roomIssue.alerts) {
      return false;
    }

    return !this.roomIssue.alerts.some(a => a.active && !a.manualResolve);
  }

  openResolve() {
    const resInfo = new ResolutionInfo();
    resInfo.notes = "";

    const ref = this.dialog.open(ResolveModalComponent, {
      width: "25vw",
      data: {
        issue: this.roomIssue,
        resInfo: resInfo,
        codes: this.data.closureCodes
      }
    });
  }

  openRespond(arrive: boolean) {
    const ref = this.dialog.open(ResponseModalComponent, {
      width: "25vw",
      data: {
        issue: this.roomIssue,
        responders: this.data.possibleResponders,
        arrive: arrive
      }
    });
  }

  resetHelpArrived() {
    this.helpArrivedSent = false;
    this.helpArrivedError = false;
    this.helpArrivedSuccess = false;
  }

  async helpArrived(resp: RoomIssueResponse) {
    if (this.helpArrivedSent) {
      return;
    }

    this.helpArrivedSent = true;
    resp.helpArrivedAt = new Date();

    try {
      const response = await this.api.UpdateIssue(this.roomIssue);
      if (response === "ok") {
        this.helpArrivedSuccess = true;

        setTimeout(() => {
          this.resetHelpArrived();
        }, 750);
      } else {
        this.helpArrivedError = true;
        resp.helpArrivedAt = undefined;

        setTimeout(() => {
          this.resetHelpArrived();
        }, 2000);
      }
    } catch (e) {
      this.helpArrivedError = true;
      resp.helpArrivedAt = undefined;
      console.error("error updating issue", e);

      setTimeout(() => {
        this.resetHelpArrived();
      }, 2000);
    }
  }

  FinishResponse(): boolean {
    if (
      this.roomIssue == null ||
      this.roomIssue.roomIssueResponses == null ||
      this.roomIssue.roomIssueResponses.length === 0
    ) {
      return false;
    }

    const lastResponse = this.roomIssue.roomIssueResponses[
      this.roomIssue.roomIssueResponses.length - 1
    ];

    if (lastResponse.helpSentAt != null && !lastResponse.SentIsZero()) {
      if (lastResponse.helpArrivedAt != null && !lastResponse.ArrivedIsZero()) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  RedirectToPi(endpoint: string, deviceID?: string) {
    let hostname = "";

    if (deviceID != null) {
      hostname = deviceID + ".byu.edu";
    } else if (this.deviceList != null) {
      for (const device of this.deviceList) {
        if (device.type.id === "Pi3") {
          hostname = device.id + ".byu.edu";
          break;
        }
      }
    }

    if (hostname.length > 0) {
      window.open("http://" + hostname + endpoint, "_blank");
    }
  }
}
