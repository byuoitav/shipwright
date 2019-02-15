import { Component, OnInit, Inject } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { RoomAlerts, Alert } from 'src/app/objects';

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

  constructor(public text: StringsService, public dialogRef: MatDialogRef<RespondModalComponent>, @Inject(MAT_DIALOG_DATA) public ra: RoomAlerts) {
    if(ra != null) {
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
      this.alertsToResolve = Array.from(this.ra.GetAlerts())
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
    if(this.ra.SentIsZero()) {
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
    this.ra.helpSent = true
    console.log(this.sentTime)
    let d = new Date()
    console.log(d.toLocaleString())

    let fullDate = new Date().toLocaleString()
    let today = fullDate.substr(0, fullDate.indexOf(","))

    let time = this.to24Hour(this.sentTime)
    let timestamp = today + ", " + time
    this.ra.sentDate = new Date(timestamp)
    console.log(this.ra.sentDate.toLocaleString())
  }

  HelpHasArrived() {
    this.ra.helpArrived = true
    console.log(this.arrivedTime)
    let d = new Date()
    console.log(d.toLocaleString())

    let fullDate = new Date().toLocaleString()
    let today = fullDate.substr(0, fullDate.indexOf(","))

    let time = this.to24Hour(this.arrivedTime)
    let timestamp = today + ", " + time
    this.ra.arriveDate = new Date(timestamp)
    console.log(this.ra.arriveDate.toLocaleString())
  }
}
