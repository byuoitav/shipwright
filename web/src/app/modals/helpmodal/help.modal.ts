import { Component, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { FormControl, Validators } from "@angular/forms";
import { APIService } from "../../services/api.service";
import { Alert } from "../../objects/alerts";
import { User } from "../../objects/users";
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

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
  myControl = new FormControl();
  options: User[] = [
    {
      userName : "andreaf",
      email : "afroberg@yahoo.com",
      homePhone: "(801) 371-2451",
      name : "Andrea Ashmore",
      employeeNumber : "92-152-4960"
    },
    {
      userName : "rrm27",
      email : "rrm27@email.byu.edu",
      homePhone: "(801) 371-2451",
      name : "Ryan Manning",
      employeeNumber : "362554249"
    },
    {
      userName : "sms263",
      email : "schow_may2000@netzero.com",
      homePhone : "(801) 796-3849",
      name : "Shane Schow",
      employeeNumber : "283180414"
    },
  ];
  filteredOptions: Observable<User[]>;

  constructor(public ref: MatDialogRef<HelpModal>, private api: APIService) {}

  ngOnInit() {
    this.filteredOptions = this.requesterFormControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );
  }

  private _filter(value: string): User[] {
    const filterValue = value.toLowerCase();
    var filteredUsers: User[] = []
    this.options.map(user => {
      if (user.name.toLowerCase().includes(filterValue)) {
        if (filteredUsers.includes(user) != true) {
          filteredUsers.push(user)
        } 
      }
      if (user.userName.toLowerCase().includes(filterValue)) {
        if (filteredUsers.includes(user) != true) {
          filteredUsers.push(user)
        }
      }
      if (user.email.toLowerCase().includes(filterValue)) {
        if (filteredUsers.includes(user) != true) {
          filteredUsers.push(user)
        }
      }
      if (user.employeeNumber.toLowerCase().includes(filterValue)) {
        if (filteredUsers.includes(user) != true) {
          filteredUsers.push(user)
        }
      }
    })
    return filteredUsers

  }

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
