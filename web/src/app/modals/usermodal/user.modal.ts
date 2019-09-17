import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { APIService } from "../../services/api.service";
import { MatDialog } from "@angular/material";
import { DetailedUser } from 'src/app/objects/users';
import { Observable } from 'rxjs';


@Component({
  selector: "usermodal",
  templateUrl: "./user.modal.html",
  styleUrls: ["./user.modal.scss"]
})
export class UserModal implements OnInit {
  user: DetailedUser[] = [];
  isLoading: boolean;

  constructor(public ref: MatDialogRef<UserModal>, private api: APIService, private dialog: MatDialog
    , @Inject(MAT_DIALOG_DATA) public data: any) {
      this.isLoading = true;
      this.api.GetUserDetails(
        this.data.netId
      ).then((resp) => {
        if (resp) {
          this.user = resp.user;
          this.isLoading = false;
        }
      });
  }

  ngOnInit() {
  }
}
