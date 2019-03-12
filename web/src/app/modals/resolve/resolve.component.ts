import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { RoomIssue, ResolutionInfo } from "src/app/objects/alerts";

import { APIService } from "src/app/services/api.service";

@Component({
  selector: "resolve-modal",
  templateUrl: "./resolve.component.html",
  styleUrls: ["./resolve.component.scss"]
})
export class ResolveModalComponent implements OnInit {
  resolving = false;
  resolved = false;
  error = false;

  constructor(
    public dialogRef: MatDialogRef<ResolveModalComponent>,
    private api: APIService,
    @Inject(MAT_DIALOG_DATA)
    public data: { issue: RoomIssue; resInfo: ResolutionInfo; codes: string[] }
  ) {}

  ngOnInit() {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  resetButton() {
    this.resolving = false;
    this.resolved = false;
    this.error = false;
  }

  async resolve() {
    if (this.resolving) {
      return;
    }

    this.resolving = true;
    this.data.resInfo.resolvedAt = new Date();

    try {
      const response = await this.api.ResolveIssue(
        this.data.issue.issueID,
        this.data.resInfo
      );

      if (response === "ok") {
        this.resolved = true;

        setTimeout(() => {
          this.resolving = false;
          this.dialogRef.close();
        }, 750);
      } else {
        this.error = true;
        setTimeout(() => {
          this.resetButton();
        }, 2000);
      }
    } catch (e) {
      this.error = true;
      setTimeout(() => {
        this.resetButton();
      }, 2000);
    }
  }
}
