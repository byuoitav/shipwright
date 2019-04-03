import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { DBResponse } from "src/app/objects/database";

@Component({
  selector: "app-notify",
  templateUrl: "./notify.component.html",
  styleUrls: ["./notify.component.scss"]
})
export class NotifyModalComponent implements OnInit {
  overallStatus: string;
  objectTitle: string;
  responseActions: string[];

  constructor(public dialogRef: MatDialogRef<NotifyModalComponent>, @Inject(MAT_DIALOG_DATA) public data: DBResponse[]) {
    let successCount = 0;
    let failureCount = 0;
    for (const resp of this.data) {
      if (resp.success) {
        successCount++;
      } else {
        failureCount++;
      }

      if (!this.responseActions.includes(resp.action)) {
        this.responseActions.push(resp.action);
      }
    }

    if (successCount > failureCount) {
      this.overallStatus = "success";
    } else if (successCount < failureCount) {
      this.overallStatus = "failure";
    } else {
      this.overallStatus = "mixed";
    }

    if (data.length === 1) {
      this.objectTitle = this.data[0].objectID;
    } else {
      this.objectTitle = "Multiple Objects";
    }
  }

  ngOnInit() {
  }
}
