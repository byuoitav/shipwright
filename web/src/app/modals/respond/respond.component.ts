import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { APIService } from 'src/app/services/api.service';
import { AlertRow } from 'src/app/objects';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'respond-modal',
  templateUrl: './respond.component.html',
  styleUrls: ['./respond.component.scss']
})
export class RespondComponent implements OnInit {
  sentTime: string;
  arriveTime: string;
  sentHelp: boolean = false;
  helpArrived: boolean = false;
  sentHelpDate = new Date(new Date(Date.now().toLocaleString() + " UTC"));
  helpArrivedDate = new Date(new Date(Date.now().toLocaleString() + " UTC"));

  constructor(public dialogRef: MatDialogRef<RespondComponent>, @Inject(MAT_DIALOG_DATA) public data: AlertRow, public api: APIService) {
    this.sentHelp = this.data.helpSent;
    this.helpArrived = this.data.helpArrived;
    if(this.data.alerts.length > 0) {
      if(this.data.alerts[0].helpSentAt != null) {
        this.sentHelpDate = this.data.alerts[0].helpSentAt;
        this.sentTime = this.timeFromISOFormat(this.sentHelpDate.toISOString());
      }
      if(this.data.alerts[0].helpArrivedAt != null) {
        this.helpArrivedDate = this.data.alerts[0].helpArrivedAt;
        this.arriveTime = this.timeFromISOFormat(this.helpArrivedDate.toISOString());
      }
    }
  }

  ngOnInit() {
  }

  SendHelp() {
    this.sentHelp = true;
  }

  HelpArrived() {
    this.helpArrived = true;
  }

  CloseAndSaveChanges() {
    this.data.helpSent = this.sentHelp;
    this.data.helpArrived = this.helpArrived;

    if(this.sentHelp) {
      let sentDateString = this.sentHelpDate.toISOString().split("T");
      this.sentHelpDate = new Date(sentDateString[0]+"T"+this.timeToISOFormat(this.sentTime));

      if(this.data.alerts.length > 0) {
        this.data.alerts[0].helpSentAt = this.sentHelpDate;
      }
    }
    
    if(this.helpArrived) {
      let arriveDateString = this.helpArrivedDate.toISOString().split("T");
      this.helpArrivedDate = new Date(arriveDateString[0]+"T"+this.timeToISOFormat(this.arriveTime));

      if(this.data.alerts.length > 0) {
        this.data.alerts[0].helpArrivedAt = this.helpArrivedDate;
      }
    }

    this.dialogRef.close();
  }

  CloseWithoutSaving() {
    this.dialogRef.close();
  }

  private timeToISOFormat(time: string):string {
    return time+":00.000Z";
  }

  private timeFromISOFormat(dateString: string):string {
    let timeString = dateString.split("T")[1].split(":");
    return timeString[0]+":"+timeString[1];
  }
}
