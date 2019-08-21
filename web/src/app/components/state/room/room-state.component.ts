import { Component, OnInit, AfterViewInit, ViewChild } from "@angular/core";
import { APIService } from "src/app/services/api.service";
import { SocketService } from "src/app/services/socket.service";
import { CombinedRoomState, StaticDevice } from "src/app/objects/static";
import { MatPaginator, MatSort, MatTableDataSource, PageEvent } from "@angular/material";
import { TextService } from 'src/app/services/text.service';

@Component({
  selector: "app-room-state",
  templateUrl: "./room-state.component.html",
  styleUrls: ["./room-state.component.scss"]
})
export class RoomStateComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  columns = ["type", "roomID", "alerts", "devices"];
  dataSource = new MatTableDataSource<CombinedRoomState>([]);
  roomStateList: CombinedRoomState[] = [];
  filteredRoomStates: CombinedRoomState[] = [];
  filterQueries: string[] = [];
  length = 360;
  pageSize = 20;
  pageSizeOptions: number[] = [5, 10, 15, 20, 25, 30, 50, 100];

  // MatPaginator Output
  pageEvent: PageEvent;

  done = false;
  constructor(
    public api: APIService,
    private socket: SocketService,
    public text: TextService
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.api.GetAllCombinedRoomStates().then((answer) => {
      this.roomStateList = answer as CombinedRoomState[];
      // console.log(this.roomStateList);
      this.done = true;

      this.roomStateList.sort((a, b) => a.roomID.localeCompare(b.roomID));

      for (const room of this.roomStateList) {
        if (room.deviceStates)  {
          room.deviceStates.sort((a, b) => {
            let aDT = a.deviceType ? a.deviceType : "";
            let bDT = b.deviceType ? b.deviceType : "";
            const aID = a.deviceID ? a.deviceID : "";
            const bID = b.deviceID ? b.deviceID : "";

            if (
              aDT.toLowerCase() === "dmps" ||
              aDT.toLowerCase() === "control-processor"
            ) {
              aDT = "aaa";
            }

            if (
              bDT.toLowerCase() === "dmps" ||
              bDT.toLowerCase() === "control-processor"
            ) {
              bDT = "aaa";
            }

            if (aDT === bDT) {
              return aID.localeCompare(bID);
            }

            return aDT.localeCompare(bDT);
          });
        }
      }

      this.filteredRoomStates = this.roomStateList;

      // refresh data each time a static device updates
      this.socket.devices.subscribe((device) => {
        if (this.roomStateList != null) {
          for (const rs of this.roomStateList) {
            if (rs.deviceStates != null) {
              for (const ds of rs.deviceStates) {
                if (ds.deviceID === device.deviceID) {
                  const index = rs.deviceStates.indexOf(ds, 0);
                  rs.deviceStates[index] = device;
                  break;
                }
              }
            }
          }
        }
        this.filteredRoomStates = this.roomStateList;
        this.filterRooms();
      });

      this.setDataSource();
    });
  }

  setDataSource() {
    this.dataSource.data = this.filteredRoomStates;

    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });

    
  }

  getDeviceName(deviceID: string): string {
    const IDParts = deviceID.split("-");
    if (IDParts.length === 3) {
      return IDParts[2];
    }
    return deviceID;
  }

  getDeviceTypes(rs: CombinedRoomState): string[] {
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

  getStyle(ds: StaticDevice): string {
    let style = "default-chip";
    let deviceType = ds.deviceType;
    if (deviceType) {
      deviceType = deviceType.toLowerCase();
    }

    let power = ds.power;
    if (power) {
      power = power.toLowerCase();
    }

    if (
      deviceType === "display" ||
      deviceType === "dmps" ||
      deviceType === "microphone"
    ) {
      if (power === "on") {
        style = "display-on";
        return style;
      }
      // style = "display-standby";
      return style;
    }
    if (deviceType === "via") {
      if (ds.currentUserCount > 0) {
        style = "display-on";
        return style;
      }
      // style = "display-standby";
      return style;
    }

    if (deviceType === "microphone") {
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

  filterRooms() {
    this.filteredRoomStates = [];
    if (this.filterQueries.length === 0) {
      this.filteredRoomStates = this.roomStateList;
      this.setDataSource();
      return;
    }

    for (const room of this.roomStateList) {
      if (this.checkRoom(room, this.filterQueries)) {
        this.filteredRoomStates.push(room);
      }
    }

    this.setDataSource();
  }

  hasBatteryCharge(ds: StaticDevice): boolean {
    return ds.batteryChargeMinutes != null;
  }

  checkRoom(room, query) {
    for (const item of query) {
      if (room.roomID.toLowerCase().includes(item.toLowerCase())) {
        continue;
      }
      if (room.staticRoom.systemType.length > 0) {
        if (
          room.staticRoom.systemType[0]
            .toLowerCase()
            .includes(item.toLowerCase())
        ) {
          continue;
        }
      }
      if (room.deviceStates != null) {
        let result = false;
        for (const device of room.deviceStates) {
          if (
            device.deviceID.toLowerCase().includes(item.toLowerCase()) &&
            !this.filteredRoomStates.includes(room)
          ) {
            result = true;
            break;
          }
        }
        if (result) {
          continue;
        }
      }
      if (item === "Has Alerts") {
        console.log("has alerts is suposed to run");
        if (this.activeAlerts(room)) {
          console.log("returned true");
          continue;
        }
      }
      if (item === "Low Mic") {
        if (this.lowMic(room)) {
          continue;
        }
      }
      if (item === "Warn Mic") {
        if (this.warnMic(room)) {
          continue;
        }
      }
      if (item === "System In Use") {
        if (this.inUse(room)) {
          continue;
        }
      }
      return false;
    }
    return true;
  }

  activeAlerts(room?: CombinedRoomState) {
    if (!this.filterQueries.includes("Has Alerts")) {
      this.filterQueries.push("Has Alerts");
      this.filterRooms();
    }
    if (room) {
      if (room.activeAlertCount > 0) {
        return true;
      }
      return false;
    }
  }

  lowMic(room?: CombinedRoomState) {
    if (!this.filterQueries.includes("Low Mic")) {
      this.filterQueries.push("Low Mic");
      this.filterRooms();
    }
    if (room) {
      if (room.deviceStates != null) {
        for (const device of room.deviceStates) {
          if (
            device.deviceType === "microphone" &&
            90 > device.batteryChargeMinutes &&
            device.batteryChargeMinutes >= 0 &&
            !this.filteredRoomStates.includes(room)
          ) {
            return true;
          }
        }
      }
      return false;
    }
  }

  warnMic(room?: CombinedRoomState) {
    if (!this.filterQueries.includes("Warn Mic")) {
      this.filterQueries.push("Warn Mic");
      this.filterRooms();
    }
    if (room) {
      if (room.deviceStates != null) {
        for (const device of room.deviceStates) {
          if (
            device.deviceType === "microphone" &&
            300 > device.batteryChargeMinutes &&
            device.batteryChargeMinutes >= 90 &&
            !this.filteredRoomStates.includes(room)
          ) {
            return true;
          }
        }
      }
      return false;
    }
  }

  inUse(room?: CombinedRoomState) {
    if (!this.filterQueries.includes("System In Use")) {
      this.filterQueries.push("System In Use");
      this.filterRooms();
    }
    if (room) {
      if (room.deviceStates != null) {
        for (const device of room.deviceStates) {
          let deviceType = device.deviceType;
          if (deviceType) {
            deviceType = deviceType.toLowerCase();
          }

          let power = device.power;
          if (power) {
            power = power.toLowerCase();
          }

          if (deviceType === "display" || deviceType === "dmps") {
            if (power === "on" && !this.filteredRoomStates.includes(room)) {
              return true;
            }
          }
        }
      }
      return false;
    }
  }
}
