import { Component, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { FormControl, Validators } from "@angular/forms";

import { APIService } from "../../services/api.service";
import { Alert } from "../../objects/alerts";

@Component({
  selector: "helpmodal",
  templateUrl: "./help.modal.html",
  styleUrls: ["./help.modal.scss"]
})
export class HelpModal implements OnInit {
  roomFormControl = new FormControl("", [
    Validators.required,
    Validators.pattern(/[A-z0-9]{2,5}(-| )[A-z0-9]+/)
  ]);

  requesterFormControl = new FormControl("", [Validators.required]);
  comment = "";

  constructor(public ref: MatDialogRef<HelpModal>, private api: APIService) {}

  ngOnInit() {}

  submit = () => {
    const a = new Alert();

    let room = this.roomFormControl.value as string;
    const requester = this.requesterFormControl.value as string;

    if (room.includes(" ")) {
      room = room.replace(" ", "-");
    }

    a.buildingID = room.substring(0, room.indexOf("-"));
    a.roomID = room;
    a.requester = requester;
    a.message = this.comment ? this.comment : "";
    a.active = true;
    a.type = "Help Request";
    a.category = "Help Request";
    a.deviceID = room + "-HR1";
    a.severity = "Critical";
    a.manualResolve = true;

    console.log("alert", a);

    this.api
      .AddAlert(a)
      .then(val => {
        console.log("successfully added alert", val);
        this.ref.close();
      })
      .catch(err => {
        alert("unable to create alert: " + err);
      });
  };
}
