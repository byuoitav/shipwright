import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { MatTableDataSource, MatPaginator } from '@angular/material';
import { CombinedRoomState, StaticDevice } from 'src/app/objects/static';
import { StringsService } from 'src/app/services/strings.service';

@Component({
  selector: 'room-state',
  templateUrl: './room-state.component.html',
  styleUrls: ['./room-state.component.scss']
})
export class RoomStateComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  dataSource: MatTableDataSource<CombinedRoomState>;
  columns = ["type","roomID","alerts","devices"];
  

  constructor(public data: DataService, public text: StringsService) {
   if (this.data.finished){
    console.log("Got the data")
    this.dataSource = new MatTableDataSource(this.data.combinedRoomStateList)
    // this.dataSource.paginator = this.paginator;

   }
   else{
     this.data.loaded.subscribe(() => {
     console.log("Subscribed to get the data")
     this.dataSource = new MatTableDataSource(this.data.combinedRoomStateList)
     console.log("list in datasource:", this.dataSource)
    //  this.dataSource.paginator = this.paginator;

      })}
   }
   
  ngOnInit() {
    if (this.dataSource == null)
      this.dataSource = new MatTableDataSource();
      
      this.dataSource.paginator = this.paginator;
  }

  ngAfterViewInit() {
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
    return ds.batteryChargeMinutes != null
  }
}