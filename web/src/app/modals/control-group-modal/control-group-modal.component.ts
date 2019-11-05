import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ControlGroup, Room, UIConfig, Panel } from 'src/app/objects/database';

export interface CGData {
  cg: ControlGroup;
  room: Room;
  uiConfig: UIConfig;
}

@Component({
  selector: "app-control-group-modal",
  templateUrl: "./control-group-modal.component.html",
  styleUrls: ["./control-group-modal.component.scss"]
})
export class ControlGroupModalComponent implements OnInit {
  tempName: string;

  constructor(public dialogRef: MatDialogRef<ControlGroupModalComponent>, @Inject(MAT_DIALOG_DATA) public data: CGData) {
    this.tempName = data.cg.name;
  }

  ngOnInit() {
  }

  togglePanel(p: Panel) {
    if (p.controlGroup === this.data.cg.name) {
      p.controlGroup = "";
    } else {
      p.controlGroup = this.data.cg.name;
    }
  }
}
