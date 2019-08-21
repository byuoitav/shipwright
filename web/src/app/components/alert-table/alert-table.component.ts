import { Component, OnInit, Input } from "@angular/core";
import { APIService } from "src/app/services/api.service";
import { RoomIssue } from "src/app/objects/alerts";
import { TextService } from "src/app/services/text.service";

import {
  animate,
  state,
  style,
  transition,
  trigger
} from "@angular/animations";
import { Router } from "@angular/router";
import { DashpanelTypes } from '../dashpanel/idashpanel';

@Component({
  selector: "alert-table",
  templateUrl: "./alert-table.component.html",
  styleUrls: ["./alert-table.component.scss"],
  animations: [
    trigger("detailExpand", [
      state(
        "collapsed",
        style({ height: "0px", minHeight: "0", display: "none" })
      ),
      state("expanded", style({ height: "*" })),
      transition(
        "expanded <=> collapsed",
        animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")
      )
    ])
  ]
})
export class AlertTableComponent implements OnInit {
  @Input() singleRoom = false;
  @Input() roomID: string;
  @Input() chosenType: DashpanelTypes;
  totalIssueList: RoomIssue[];
  filteredRoomIssues: RoomIssue[];

  filterQueries: string[] = [];

  issueColumns: string[] = [
    "severity",
    "systemType",
    "roomID",
    "count",
    "types",
    "incidentAge",
    "lastNote",
    "expand"
  ];
  alertColumns: string[] = [
    "severity-color",
    "name",
    "type",
    "category",
    "message",
    "start-time",
    "end-time"
  ];

  expIssue: RoomIssue | null;

  pageOptions: number[] = [16, 32, 64, 128, 256];
  pageSize = 32;

  constructor(
    public api: APIService,
    public text: TextService,
    public router: Router
  ) { }

  ngOnInit() {
    if (this.singleRoom) {
      if (this.roomID !== null) {
        this.api.GetRoomIssue(this.roomID).then((answer) => {
          if (answer !== undefined) {
            this.totalIssueList = [];
            this.totalIssueList.push(answer as RoomIssue);
            this.filter();
          }
        });
      }
    } else {
      this.api.GetAllIssues().then((answer) => {
        this.totalIssueList = answer as RoomIssue[];
        console.log(this.totalIssueList);
        this.filter();
      });
    }
  }

  filterByType() {
    const newList: RoomIssue[] = [];

    if (this.chosenType === DashpanelTypes.AllAlerts) {
      // don't make any changes, just use the whole list of issues
      return;
    }

    for (const i of this.totalIssueList) {
      // if the severity matches
      if (i.activeAlertSeverities.includes(DashpanelTypes.toString(this.chosenType))) {
        newList.push(i);
      }
      // if the issue was recently resolved
      // if the issue refers to a room in maintenance mode
      // if the issue refers to a room in dev or stage
    }
  }

  filter() {
    this.filteredRoomIssues = [];

    if (this.filterQueries.length === 0) {
      this.filteredRoomIssues = this.totalIssueList;
      return;
    }

    for (const i of this.totalIssueList) {
      for (const q of this.filterQueries) {
        if (i.buildingID.toLowerCase().includes(q.toLowerCase()) && !this.filteredRoomIssues.includes(i)) {
          this.filteredRoomIssues.push(i);
        }
        if (i.roomID.toLowerCase().includes(q.toLowerCase()) && !this.filteredRoomIssues.includes(i)) {
          this.filteredRoomIssues.push(i);
        }
        if (i.systemType.toLowerCase().includes(q.toLowerCase()) && !this.filteredRoomIssues.includes(i)) {
          this.filteredRoomIssues.push(i);
        }
      }
    }
  }

  getIssueAge = (issue: RoomIssue) => {
    if (issue == null) {
      return;
    }
    // loop through each alert
    let oldestalert = new Date();
    // find oldest start time
    for (const alert of issue.alerts) {
      if (alert.startTime < oldestalert) {
        oldestalert = alert.startTime;
      }
    }
    return this.text.getReadableTimestamp(oldestalert, false);
  }

  shouldIExpand = (issue: RoomIssue): boolean => {
    if (this.expIssue === issue) {
      return true;
    } else {
      return this.singleRoom;
    }
  }

  expandRow = (issue: RoomIssue) => {
    if (!this.singleRoom) {
      if (this.expIssue === issue) {
        this.expIssue = null;
      } else {
        this.expIssue = issue;
      }
    }
  }

  goToAlerts(roomID: string) {
    this.router.navigate(["/campus/" + roomID + "/tab/2"]);
  }

  getTotalAlertCount() {
    let count = 0;
    for (const issue of this.totalIssueList) {
      if (issue.alertCount !== undefined) {
        count += issue.alertCount;
      }
    }
    return count;
  }

  getTotalActiveAlertCount() {
    let count = 0;
    for (const issue of this.totalIssueList) {
      if (issue.activeAlertCount !== undefined) {
        count += issue.activeAlertCount;
      }
    }
    return count;
  }
}
