import { Component, OnInit, Input } from "@angular/core";
import { Room } from "src/app/objects/database";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: "room-monitoring",
  templateUrl: "./monitoring.component.html",
  styleUrls: ["./monitoring.component.scss"]
})
export class MonitoringComponent implements OnInit {
  @Input() room: Room;
  roomID: string;

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.roomID = params["roomID"];
    });
  }

  ngOnInit() {
  }

}
