import { Component, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { FormControl, Validators } from "@angular/forms";
import { APIService } from "../../services/api.service";
import { Alert } from "../../objects/alerts";
import { User } from "../../objects/users";
import {Observable} from 'rxjs';
import {debounceTime, switchMap, tap, distinctUntilChanged} from 'rxjs/operators';
import { MatDialog } from "@angular/material";
import { UserModal } from '../usermodal/user.modal';

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
  options: User[] = [];
  filteredOptions: Observable<User[]>;
  isLoading: boolean;

  constructor(public ref: MatDialogRef<HelpModal>, private api: APIService, private dialog: MatDialog) {
    this.filteredOptions = this.requesterFormControl
      .valueChanges
      .pipe(
        debounceTime(2000),
        distinctUntilChanged(),
        tap((value) => (value.toString().length > 3? this.isLoading = true: this.isLoading = false)),
        switchMap(value => (value.toString().length > 3? this.api.GetUsers(value).finally(() => this.isLoading = false): this.filteredOptions)
        )
      );
  }

  ngOnInit() {
    
  }

  getUserDetails(userName: string) {
    console.log("lets see if this works: ", userName);
    this.dialog.open(UserModal, {
      data: { netId: userName },
    });
  }

  //This function changes the vlaue that is displayed on the caller autocomplete
  displayFn(user?: User): string | undefined {
    return user ? user.name : undefined;
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
