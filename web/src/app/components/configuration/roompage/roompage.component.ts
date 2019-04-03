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
  urlParams: URLSearchParams;

  tabMap = {
    alerts: 0,
    builder: 1,
    routing: 2
  };

  @ViewChild("builder") roomBuilder: BuilderComponent;

  constructor(
    public text: StringsService,
    private route: ActivatedRoute,
    public data: DataService
  ) {
    this.urlParams = new URLSearchParams(window.location.search);

    if (this.urlParams.has("tab")) {
      this.selectedTab = this.tabMap[this.urlParams.get("tab")];
    } else {
      // this.TabChange(this.selectedTab);
    }
    this.route.params.subscribe(params => {
      this.roomID = params["roomID"];

      if (this.data.finished) {
        this.room = this.data.GetRoom(this.roomID);
        if (this.NotADump()) {
          this.devices = this.data.roomToDevicesMap.get(this.roomID);
        }
      } else {
        this.data.loaded.subscribe(() => {
          this.room = this.data.GetRoom(this.roomID);
          if (this.NotADump()) {
            this.devices = this.data.roomToDevicesMap.get(this.roomID);
          }
        });
      }
    });
  }

  canDeactivate(): boolean | Observable<boolean> {
    if (this.roomBuilder != null) {
      return this.roomBuilder.canDeactivate();
    } else {
      return true;
    }
  }

  ngOnInit() {}

  NotADump(): boolean {
    if (this.room == null) {
      return false;
    }
    return this.room.configuration.id !== "DMPS";
  }

  TabChange(tabIndex: number) {
    if (tabIndex === 0) {
      this.urlParams.set("tab", "alerts");
      window.location.pathname =
        window.location.pathname + "?" + this.urlParams.toString();
    }
    if (tabIndex === 1) {
      this.urlParams.set("tab", "builder");
      window.location.pathname =
        window.location.pathname + "?" + this.urlParams.toString();
    }
    if (tabIndex === 2) {
      this.urlParams.set("tab", "routing");
      window.location.pathname =
        window.location.pathname + "?" + this.urlParams.toString();
    }
  }
}
