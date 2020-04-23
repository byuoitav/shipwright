import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MatSort, MatTableDataSource, MatDialog } from "@angular/material";

import { APIService } from "../../../services/api.service";
import { RoomIssue, Alert, Event, EventType, Severity } from "../../../objects/alerts";
import { ResolveModalComponent } from 'src/app/modals/resolvemodal/resolvemodal.component';
import { Device } from 'src/app/objects/database';

@Component({
  selector: "room-monitoring",
  templateUrl: "./monitoring.component.html",
  styleUrls: ["./monitoring.component.scss"]
})
export class MonitoringComponent implements OnInit {
  roomID: string;
  issue: RoomIssue;
  comment: string;

  piList: Device[] = [];
  selectedUIDevice: string = "";
  selectedZpatternDevice: string = "";

  dataSource: MatTableDataSource<Alert>;

  cols = ["deviceID", "type", "message", "startTime"];

  tempEvents: Event[] = [];

  @ViewChild(MatSort) sort: MatSort;

  constructor(private api: APIService, private route: ActivatedRoute, private dialog: MatDialog) {}

  ngOnInit() {
    this.route.params.subscribe(async params => {
      if (params) {
        this.roomID = params["roomID"];
        this.issue = await this.api.GetRoomIssue(this.roomID);

        this.dataSource = new MatTableDataSource(this.issue.alerts);
        this.dataSource.sort = this.sort;

        console.log("this.issue", this.issue);

        this.api.GetDevicesByRoomAndRole(this.roomID, "ControlProcessor").then((devs) => {
          this.piList = devs as Device[];
          this.selectedUIDevice = this.piList[0].name;
          this.selectedZpatternDevice = this.piList[0].name;
        });

        this.makeTempEvents();
      }
    });
  }

  makeComment = async (comment: string) => {
    // if (!this.issue.notesLog) {
    //   this.issue.notesLog = [];
    // }

    // // TODO username
    // const fullComment =
    //   "username (" + new Date().toISOString() + ")|" + comment.trim();

    // this.issue.notes = fullComment;
    // this.issue.notesLog.push(fullComment);

    // // TODO i hate doing this
    // // have to set these times so that the backend doesn't flip out
    // for (const alert of this.issue.alerts) {
    //   if (!alert.endTime) {
    //     alert.endTime = new Date("1970-01-01T00:00:00.000Z");
    //   }
    // }

    // try {
    //   const resp = await this.api.UpdateIssue(this.issue);

    //   if (resp !== "ok") {
    //     alert("unable to add comment: " + resp);
    //     console.warn("unexpected response adding a comment: ", resp);
    //   } else {
    //     console.log("successfully updated note");
    //   }
    // } catch (e) {
    //   console.warn("unable to add comment", e);
    //   alert("unable to add comment: " + e);
    // }

    const n1: Event = {
      type: EventType.Note,
      at: new Date(),
      note: comment,
      personName: "Secret Agent Man"
    }

    this.tempEvents.push(n1);
  };

  openControlUI = () => {
    const url = "http://" + this.roomID + "-" + this.selectedUIDevice + ".byu.edu/";
    window.open(url, "_blank");
  };

  openZPattern = () => {
    const url = "http://" + this.roomID + "-" + this.selectedZpatternDevice + ".byu.edu:10000/dashboard";
    window.open(url, "_blank");
  };

  openResolveModal = () => {
    this.dialog.open(ResolveModalComponent, {data: this.issue})
  }

  private makeTempEvents() {
    const e1: Event = {
      type: EventType.AlertStart,
      at: new Date(),
      alertID: "8675309",
    }

    const e2: Event = {
      type: EventType.Note,
      at: new Date(),
      note: "You are obviously a non-conformist, and a rebel!",
      personID: "derek420",
      personName: "Derek Burgermeister",
      personLink: "https://christmas-specials.fandom.com/wiki/Burgermeister_Meisterburger"
    }

    const e3: Event = {
      type: EventType.PersonSent,
      at: new Date(),
      personID: "derek420",
      personName: "Derek Burgermeister",
      personLink: "https://christmas-specials.fandom.com/wiki/Burgermeister_Meisterburger"
    }

    const e4: Event = {
      type: EventType.PersonArrived,
      at: new Date(),
      personID: "derek420",
      personName: "Derek Burgermeister",
      personLink: "https://christmas-specials.fandom.com/wiki/Burgermeister_Meisterburger" 
    }

    const e5: Event = {
      type: EventType.ChangedSeverity,
      at: new Date(),
      from: Severity.Critical,
      to: Severity.Low
    }

    const e6: Event = {
      type: EventType.AlertEnd,
      at: new Date(),
      alertID: "8675309"
    }

    const e7: Event = {
      type: EventType.Note,
      at: new Date(),
      note: "Voilà! In view, a humble vaudevillian veteran, cast vicariously as both victim and villain by the vicissitudes of Fate. This visage, no mere veneer of vanity, is a vestige of the vox populi, now vacant, vanished. However, this valourous visitation of a bygone vexation stands vivified, and has vowed to vanquish these venal and virulent vermin vanguarding vice and vouchsafing the violently vicious and voracious violation of volition! The only verdict is vengeance; a vendetta held as a votive, not in vain, for the value and veracity of such shall one day vindicate the vigilant and the virtuous. Verily, this vichyssoise of verbiage veers most verbose, so let me simply add that it's my very good honour to meet you and you may call me V.",
      personID: "v",
      personName: "V",
      personLink: "https://images-na.ssl-images-amazon.com/images/G/01/digital/video/hero/Movies/Top250/B000I186FW_vforvendetta_UXWB1._SX1080_.jpg"
    }

    this.tempEvents = [e1, e2, e3, e4, e5, e6, e7];
  }
}
