import { Component, OnInit, Inject } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { RoomAlerts } from 'src/app/objects';

@Component({
  selector: 'respond-modal',
  templateUrl: './respond.component.html',
  styleUrls: ['./respond.component.scss']
})
export class RespondModalComponent implements OnInit {
  sentHelpDate: Date = new Date();
  helpArrivedDate: Date = new Date();
  ra: RoomAlerts = new RoomAlerts();

  sentTime: string;
  arrivedTime: string;

  constructor(public text: StringsService, public dialogRef: MatDialogRef<RespondModalComponent>, @Inject(MAT_DIALOG_DATA) data: RoomAlerts) {
    if(data != null) {
      Object.assign(this.ra, data)
      console.log(this.ra.SentIsZero())
      console.log(this.ra.ArriveIsZero())
    }
  }

  ngOnInit() {
  }
}
