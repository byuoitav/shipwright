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
  sentHelpDate = new Date();
  helpArrivedDate = new Date();
  ra: RoomAlerts = new RoomAlerts();

  sentTime: string;
  arrivedTime: string;

  constructor(public text: StringsService, public dialogRef: MatDialogRef<RespondModalComponent>, @Inject(MAT_DIALOG_DATA) data: RoomAlerts) {
    if(data != null) {
      Object.assign(this.ra, data)
      // console.log(this.ra.sentDate.toISOString())
      // console.log(this.ra.arriveDate.toISOString())
      // console.log(this.sentHelpDate.toTimeString())
      // console.log(this.helpArrivedDate.toISOString())

      if(!this.ra.SentIsZero()) {
        this.sentHelpDate = this.ra.sentDate;
        // console.log(this.sentHelpDate.toISOString())
      }
      this.sentTime = this.sentHelpDate.toTimeString().substring(0, this.sentHelpDate.toTimeString().lastIndexOf(":"))
      if(!this.ra.ArriveIsZero()) {
        this.helpArrivedDate = this.ra.arriveDate;
        // console.log(this.helpArrivedDate.toISOString())
      }
      this.arrivedTime = this.helpArrivedDate.toTimeString().substring(0, this.helpArrivedDate.toTimeString().lastIndexOf(":"))
    }
  }

  ngOnInit() {
  }

  private timeToISOFormat(time: string):string {
    return time+":00.000Z";
  }

  private timeFromISOFormat(dateString: string):string {
    let timeString = dateString.split("T")[1].split(":");
    return timeString[0]+":"+timeString[1];
  }
}
