import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";
import { DataService } from "src/app/services/data.service";
import { MatTableDataSource, MatPaginator } from "@angular/material";
import { CombinedRoomState, StaticDevice } from "src/app/objects/static";
import { StringsService } from "src/app/services/strings.service";
import {PageEvent} from "@angular/material";
import {MatSort} from "@angular/material";

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
    this.dataSource.sort = this.sort;
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

  checkRoom(room, query) {
    for (const item of query) {
      if (room.roomID.toLowerCase().includes(item.toLowerCase())) {
        continue;
      }
      if (room.staticRoom.systemType.length > 0) {
        if (room.staticRoom.systemType[0].toLowerCase().includes(item.toLowerCase())) {
          continue;
        }
      }
      if (room.deviceStates != null) {
        let result = false;
        for (const device of room.deviceStates) {
          if (device.deviceID.toLowerCase().includes(item.toLowerCase()) && !this.filteredRoomList.includes(room)) {
            result = true;
            break;
          }
        }
        if (result) {
          continue;
        }
      }
      return false;
    }
    return true;
  }

  FilterRooms() {
    this.filteredRoomList = [];
    if (this.filterQueries.length === 0) {
      this.filteredRoomList = this.roomList;
      this.dataSource.data = this.filteredRoomList;
      return;
    }
    for (const room of this.roomList) {
      if (this.checkRoom(room, this.filterQueries)) {
        this.filteredRoomList.push(room);
      }
    }
    this.dataSource.data = this.filteredRoomList;
  }

  activeAlerts() {
    this.filteredRoomList = [];
    for (const room of this.roomList) {
      if (room.activeAlertCount > 0) {
        this.filteredRoomList.push(room);
      }
    }
    this.dataSource.data = this.filteredRoomList;
  }
  lowMic() {
    this.filteredRoomList = [];
    for (const room of this.roomList) {
      if (room.deviceStates != null) {
        for (const device of room.deviceStates) {
          if (device.deviceType === "microphone" && 90 > device.batteryChargeMinutes && device.batteryChargeMinutes >= 0 
          && !this.filteredRoomList.includes(room)) {
            this.filteredRoomList.push(room);
          }
        }
      }
    }
    this.dataSource.data = this.filteredRoomList;
  }
  warnMic() {
    this.filteredRoomList = [];
    for (const room of this.roomList) {
      if (room.deviceStates != null) {
        for (const device of room.deviceStates) {
          if (device.deviceType === "microphone" && 300 > device.batteryChargeMinutes && device.batteryChargeMinutes >= 90 
          && !this.filteredRoomList.includes(room)) {
            this.filteredRoomList.push(room);
          }
        }
      }
    }
    this.dataSource.data = this.filteredRoomList;
  }

  inUse() {
    this.filteredRoomList = [];
    for (const room of this.roomList) {
      if (room.deviceStates != null) {
        for (const device of room.deviceStates) {
          if (device.deviceType === "display" || device.deviceType === "dmps") {
            if (device.power === "on" && !this.filteredRoomList.includes(room)) {
              this.filteredRoomList.push(room);
            }
          }
        }
      }
    }
    this.dataSource.data = this.filteredRoomList;
  }
}
