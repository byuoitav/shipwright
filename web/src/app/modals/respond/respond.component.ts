import { Component, OnInit, Inject } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Alert, RoomIssue } from 'src/app/objects/alerts';
import { DataService } from 'src/app/services/data.service';

export interface ResolveInfo {
  issue: RoomIssue,
  selected: Alert[]
}

@Component({
  selector: 'respond-modal',
  templateUrl: './respond.component.html',
  styleUrls: ['./respond.component.scss']
})
export class RespondModalComponent implements OnInit {

  constructor(public text: StringsService, public dialogRef: MatDialogRef<RespondModalComponent>, @Inject(MAT_DIALOG_DATA) public info: ResolveInfo, public data: DataService) {
    
  }

  ngOnInit() {
  }

  UpdateSelected() {
    if (this.info.selected.length === 0) {
      this.info.selected = this.info.issue.alerts;
    }
  }
}
