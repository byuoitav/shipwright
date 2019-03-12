import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";
import { DataService } from "src/app/services/data.service";
import { MatTableDataSource, MatPaginator } from "@angular/material";
import { CombinedRoomState, StaticDevice } from "src/app/objects/static";
import { StringsService } from "src/app/services/strings.service";
import {PageEvent} from "@angular/material";

@Component({
  selector: "room-state",
  templateUrl: "./room-state.component.html",
  styleUrls: ["./room-state.component.scss"]
})
export class RoomStateComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  dataSource: MatTableDataSource<CombinedRoomState>;
  columns = ["type", "roomID", "alerts", "devices"];
  roomList: CombinedRoomState[] = [];
  filteredRoomList: CombinedRoomState[] = [];
  filterQueries: string[] = [];

  length = 360;
  pageSize = 20;
  pageSizeOptions: number[] = [5, 10, 15, 20, 25, 30, 50, 100];

  // MatPaginator Output
  pageEvent: PageEvent;

  constructor(public data: DataService, public text: StringsService) {
   if (this.data.finished) {
    console.log("Got the data");
    this.roomList = this.data.combinedRoomStateList;
    this.filteredRoomList = this.roomList;
    this.dataSource = new MatTableDataSource(this.filteredRoomList);
    // this.dataSource.paginator = this.paginator;

   }
   else {
     this.data.loaded.subscribe(() => {
     console.log("Subscribed to get the data");
     this.roomList = this.data.combinedRoomStateList;
     this.filteredRoomList = this.roomList;
     this.dataSource = new MatTableDataSource(this.filteredRoomList);
     console.log("list in datasource:", this.dataSource);
    //  this.dataSource.paginator = this.paginator;
      })}
   }

  ngOnInit() {
    // if (this.dataSource == null) {
    //   this.dataSource = new MatTableDataSource();
    // }
    // this.dataSource.paginator = this.paginator;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  GetDeviceName(deviceID: string): string {
    const IDParts = deviceID.split("-");
    if (IDParts.length === 3) {
      return IDParts[2];
    }
    return deviceID;
  }

  GetDeviceTypes(rs: CombinedRoomState): string[] {
    let deviceTypes: string[] = [];
    if (rs != null && rs.deviceStates != null) {
      for (const ds of rs.deviceStates) {
        if (!deviceTypes.includes(ds.deviceType)) {
          deviceTypes.push(ds.deviceType);
        }
      }
      deviceTypes = deviceTypes.sort();

    }
    return deviceTypes;
  }

  GetStyle(ds: StaticDevice): string {
    let style = "default-chip";
    if (ds.deviceType === "display" || ds.deviceType === "dmps") {
      if (ds.power === "on") {
        style = "display-on";
        return style;
      }
      // style = "display-standby";
      return style;
    }
    if (ds.deviceType === "via") {
      if (ds.currentUserCount > 0) {
        style = "display-on";
        return style;
      }
      // style = "display-standby";
      return style;
    }

    if (ds.deviceType === "microphone") {
      if (ds.batteryChargeMinutes >= 300) {
        style = "mic-good";
        return style;
      }
      if (300 > ds.batteryChargeMinutes && ds.batteryChargeMinutes >= 90) {
        style = "mic-okay";
        return style;
      }
      if (90 > ds.batteryChargeMinutes && ds.batteryChargeMinutes >= 0) {
        style = "mic-bad";
        return style;
      }
    }

    return style;
  }

  HasBatteryCharge(ds: StaticDevice): boolean {
    return ds.batteryChargeMinutes != null;
  }

  FilterBuildings() {
    this.filteredRoomList = [];

    if (this.filterQueries.length === 0) {
      this.filteredRoomList = this.roomList;
      return;
    }

    for (const room of this.roomList) {
        for (const query of this.filterQueries) {
          if (room.roomID.toLowerCase().includes(query.toLowerCase()) && !this.filteredRoomList.includes(room)) {
            this.roomList.push(room);
          }
          if (room.staticRoom.systemType[0].toLowerCase().includes(query.toLowerCase()) && !this.filteredRoomList.includes(room)) {
            this.roomList.push(room);
          }
      }
    }
  }
}
