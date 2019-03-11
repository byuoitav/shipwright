import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { Alert, RoomIssue } from "src/app/objects/alerts";
import { DataService } from "src/app/services/data.service";

export interface ResolveInfo {
  issue: RoomIssue;
  selected: Alert[];
}

@Component({
  selector: "resolve-modal",
  templateUrl: "./resolve.component.html",
  styleUrls: ["./resolve.component.scss"]
})
export class ResolveModalComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ResolveModalComponent>,
    @Inject(MAT_DIALOG_DATA) public stuff: any,
    public data: DataService
  ) {}

  ngOnInit() {}
}
