import { Component, OnInit, Inject } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Alert, RoomIssue } from 'src/app/objects/alerts';

@Component({
  selector: 'respond-modal',
  templateUrl: './respond.component.html',
  styleUrls: ['./respond.component.scss']
})
export class RespondModalComponent implements OnInit {
  sentHelpDate = new Date();
  helpArrivedDate = new Date();

  alertsToResolve: Alert[] = [];

  sentTime: string;
  arrivedTime: string;

  constructor(public text: StringsService, public dialogRef: MatDialogRef<RespondModalComponent>, @Inject(MAT_DIALOG_DATA) public issue: RoomIssue) {
    if(issue != null) {
      // console.log(this.issue.helpSentAt.toISOString())
      // console.log(this.issue.helpArrivedAt.toISOString())
      // console.log(this.sentHelpDate.toTimeString())
      // console.log(this.helpArrivedDate.toISOString())

      if(!this.issue.SentIsZero()) {
        this.sentHelpDate = this.issue.helpSentAt;
        // console.log(this.sentHelpDate.toISOString())
      }
      this.sentTime = this.sentHelpDate.toTimeString().substring(0, this.sentHelpDate.toTimeString().lastIndexOf(":"))
      if(!this.issue.ArrivedIsZero()) {
        this.helpArrivedDate = this.issue.helpArrivedAt;
        // console.log(this.helpArrivedDate.toISOString())
      }
      this.arrivedTime = this.helpArrivedDate.toTimeString().substring(0, this.helpArrivedDate.toTimeString().lastIndexOf(":"))
      this.alertsToResolve = Array.from(this.issue.GetAlerts())
      console.log(this.alertsToResolve);
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

  private to24Hour(time: string): string {
    let hours = time.split(":")[0]
    let mins = time.split(":")[1]
    let period

    let hoursNum = +hours

    if(hoursNum < 12) {
      period = "AM"
    }
    else {
      period = "PM"
    }

    if(hoursNum > 12) {
      hoursNum = hoursNum-12  
      hours = String(hoursNum)
      if(hours.length == 1) {
        hours = "0"+hours
      }
    }

    return hours + ":" + mins + " " + period 
  }

  CanResolve():boolean {
    if(this.issue.SentIsZero()) {
      return false
    }

    for(let a of this.alertsToResolve) {
      if(a.active) {
        return false
      }
    }

    return true
  }

  HelpWasSent() {
    console.log(this.sentTime)
    let d = new Date()
    console.log(d.toLocaleString())

    let fullDate = new Date().toLocaleString()
    let today = fullDate.substr(0, fullDate.indexOf(","))

    let time = this.to24Hour(this.sentTime)
    let timestamp = today + ", " + time
    this.issue.helpSentAt = new Date(timestamp)
    console.log(this.issue.helpSentAt.toLocaleString())
  }

  HelpHasArrived() {
    console.log(this.arrivedTime)
    let d = new Date()
    console.log(d.toLocaleString())

    let fullDate = new Date().toLocaleString()
    let today = fullDate.substr(0, fullDate.indexOf(","))

    let time = this.to24Hour(this.arrivedTime)
    let timestamp = today + ", " + time
    this.issue.helpArrivedAt = new Date(timestamp)
    console.log(this.issue.helpArrivedAt.toLocaleString())
  }
}
