import { Component, OnInit, Input } from '@angular/core';
import { Event, EventType, Severity } from 'src/app/objects/alerts';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss']
})
export class EventComponent implements OnInit {
  @Input() eventData: Event

  eventTypeIcons: Map<EventType, string> = new Map();

  constructor() {
    this.eventTypeIcons.set(EventType.AlertStart, "alarm");
    this.eventTypeIcons.set(EventType.AlertEnd, "alarm_on");
    this.eventTypeIcons.set(EventType.Note, "chat");
    this.eventTypeIcons.set(EventType.PersonSent, "flight_takeoff");
    this.eventTypeIcons.set(EventType.PersonArrived, "flight_land");
    this.eventTypeIcons.set(EventType.ChangedSeverity, "assessment");

    // console.log(this.eventData.toString());
  }

  ngOnInit() {
  }

  eventToString(): string {
    var toReturn = "";
    switch (this.eventData.type) {
      case EventType.AlertStart:
        toReturn = "Alert " + this.eventData.alertID + " started at " + this.eventData.at.toLocaleTimeString() + " on " + this.eventData.at.toLocaleDateString() + ".";
        break;
      case EventType.AlertEnd:
        toReturn = "Alert " + this.eventData.alertID + " ended at " + this.eventData.at.toLocaleTimeString() + " on " + this.eventData.at.toLocaleDateString() + ".";
        break;
      case EventType.Note:
        toReturn = this.eventData.note;
        break;
      case EventType.PersonSent:
        toReturn = this.eventData.personName + " was sent to respond to this issue.";
        break;
      case EventType.PersonArrived:
        toReturn = this.eventData.personName + " arrived to respond to this issue.";
        break;
      case EventType.ChangedSeverity:
        toReturn = "Issue severity changed from " + Severity[this.eventData.from] + " to " + Severity[this.eventData.to] + ".";
        break;
      default:
        break;
    }
    console.log(toReturn);
    return toReturn;
  }
}
