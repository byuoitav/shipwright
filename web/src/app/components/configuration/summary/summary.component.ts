import { Component, OnInit, ViewChild, ChangeDetectorRef } from "@angular/core";
import { StringsService } from "src/app/services/strings.service";
import { ActivatedRoute } from "@angular/router";
import { DataService } from "src/app/services/data.service";
import { ModalService } from "src/app/services/modal.service";
import { Alert, RoomIssue, RoomIssueResponse, ResolutionInfo } from "src/app/objects/alerts";
import { Device, Person } from "src/app/objects/database";
import { AlertTableComponent } from "../../dashboard/alerttable/alerttable.component";
import { APIService } from "src/app/services/api.service";
import { MatDialog, MatDialogRef } from "@angular/material";
import { ResolveModalComponent } from "../../../modals/resolve/resolve.component";

@Component({
  selector: "app-summary",
  templateUrl: "./summary.component.html",
  styleUrls: ["./summary.component.scss"]
})
export class SummaryComponent implements OnInit {
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

  @ViewChild(AlertTableComponent) table: AlertTableComponent;

  constructor(
    public text: StringsService,
    private route: ActivatedRoute,
    public data: DataService,
    public modal: ModalService,
    private dialog: MatDialog,
    private api: APIService,
    private changes: ChangeDetectorRef
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

  SetupSummary() {
    this.roomIssue = this.data.GetRoomIssue(this.roomID);
    if (this.roomIssue.roomIssueResponses == null) {
      this.roomIssue.roomIssueResponses = [];
    }

    this.deviceList = this.data.roomToDevicesMap.get(this.roomID);
    this.filteredDevices = this.deviceList;
    this.filteredResponders = this.data.possibleResponders;

    this.data.issueEmitter.subscribe(changedIssue => {
      if (!this.changes["destroyed"]) {
        if (changedIssue.roomID === this.roomID) {
          this.roomIssue = this.data.GetRoomIssue(this.roomID);
          this.changes.detectChanges();
        }
      }
    });
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

  UpdateIssue(issue: RoomIssue) {
    if (issue.ResolvedAtIsZero()) {
      issue.resolutionInfo.resolvedAt = new Date("1970-01-01T00:00:00.000Z");
    }
    for (const alert of issue.alerts) {
      alert.endTime = new Date("1970-01-01T00:00:00.000Z");
    }
    console.log(issue);
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
        now.toLocaleTimeString() +
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
    if (this.roomIssue == null || this.roomIssue === undefined) {
      return false;
    }

    if (this.roomIssue.alerts == null || this.roomIssue === undefined) {
      return false;
    }

    return !this.roomIssue.alerts.some(a => a.active && !a.manualResolve);
  }

  openResolve() {
    const ref = this.dialog.open(ResolveModalComponent, {
      width: "25vw",
      data: {}
    });

    ref.afterClosed().subscribe(result => {});
  }

  /*
  resolve() {
    const info = new ResolutionInfo();
    info.code = "hi";
    info.notes = "closed!";
    info.resolvedAt = new Date();

    await this.api.ResolveIssue(this.roomIssue.issueID, info);
  }
     */
}
