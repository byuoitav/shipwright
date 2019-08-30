import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MatSort, MatTableDataSource } from "@angular/material";

import { APIService } from "../../../services/api.service";
import { RoomIssue, Alert } from "../../../objects/alerts";

@Component({
  selector: "room-monitoring",
  templateUrl: "./monitoring.component.html",
  styleUrls: ["./monitoring.component.scss"]
})
export class MonitoringComponent implements OnInit {
  roomID: string;
  issue: RoomIssue;

  dataSource: MatTableDataSource<Alert>;

  cols = ["deviceID", "type", "message", "startTime"];

  @ViewChild(MatSort) sort: MatSort;

  constructor(private api: APIService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(async params => {
      if (params) {
        this.roomID = params["roomID"];
        this.issue = await this.api.GetRoomIssue(this.roomID);

        this.dataSource = new MatTableDataSource(this.issue.alerts);
        this.dataSource.sort = this.sort;

        console.log("this.issue", this.issue);
      }
    });
  }

  makeComment = async (comment: string) => {
    if (!this.issue.notesLog) {
      this.issue.notesLog = [];
    }

    // TODO username
    const fullComment =
      "username (" + new Date().toISOString() + ")|" + comment.trim();

    this.issue.notes = fullComment;
    this.issue.notesLog.push(fullComment);

    // TODO i hate doing this
    // have to set these times so that the backend doesn't flip out
    for (const alert of this.issue.alerts) {
      if (!alert.endTime) {
        alert.endTime = new Date("1970-01-01T00:00:00.000Z");
      }
    }

    try {
      const resp = await this.api.UpdateIssue(this.issue);

      if (resp !== "ok") {
        alert("unable to add comment: " + resp);
        console.warn("unexpected response adding a comment: ", resp);
      } else {
        console.log("successfully updated note");
      }
    } catch (e) {
      console.warn("unable to add comment", e);
      alert("unable to add comment: " + e);
    }
  };
}
