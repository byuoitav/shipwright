import { Component, OnInit, ViewChild } from "@angular/core";
import { StringsService } from "src/app/services/strings.service";
import { ActivatedRoute, CanDeactivate } from "@angular/router";
import { DataService } from "src/app/services/data.service";
import { Room, Device } from "src/app/objects/database";
import { BuilderComponent } from "./builder/builder.component";
import { Observable } from "rxjs";
import { ComponentCanDeactivate } from "src/app/pending-changes.guard";

@Component({
  selector: "room-page",
  templateUrl: "./roompage.component.html",
  styleUrls: ["./roompage.component.scss"]
})
export class RoomPageComponent implements OnInit, CanDeactivate<ComponentCanDeactivate> {
  roomID: string;
  room: Room;
  devices: Device[] = [];

  selectedTab = 2;

  @ViewChild("builder") roomBuilder: BuilderComponent;

  constructor(
    public text: StringsService,
    private route: ActivatedRoute,
    public data: DataService
  ) {
    this.route.params.subscribe(params => {
      this.roomID = params["roomID"];
      this.selectedTab = +params["tab"] - 1;

      if (this.data.finished) {
        this.room = this.data.GetRoom(this.roomID);
          this.devices = this.data.roomToDevicesMap.get(this.roomID);
      } else {
        this.data.loaded.subscribe(() => {
          this.room = this.data.GetRoom(this.roomID);
            this.devices = this.data.roomToDevicesMap.get(this.roomID);
        });
      }
    });
  }

  ngOnInit() {}

  canDeactivate(): boolean | Observable<boolean> {
    if (this.roomBuilder != null) {
      return this.roomBuilder.canDeactivate();
    } else {
      return true;
    }
  }

  TabChange(tabIndex: number) {
    const currentURL = window.location.pathname;
    const newURL = currentURL.substr(0, (currentURL.length - 1)) + (tabIndex + 1);
    window.history.replaceState(
      null,
      this.text.WebsiteTitle,
      newURL
    );
  }
}
