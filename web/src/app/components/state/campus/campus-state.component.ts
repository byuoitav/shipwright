import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { StringsService } from 'src/app/services/strings.service';
import { MonitoringService } from 'src/app/services/monitoring.service';
import { DataService } from 'src/app/services/data.service';


export interface UserData {
  room: string;
  activeSignal: boolean;
  alerts: Int16Array;
  device: string;
  status: string;
  buildingID: string;
}

@Component({
  selector: 'campus-state',
  templateUrl: './campus-state.component.html',
  styleUrls: ['./campus-state.component.scss']
})
export class CampusStateComponent implements OnInit {
  stateColumns = ['room', 'alerts', 'status'];

  // dataSource: MatTableDataSource<FakeStaticRoom>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(public text: StringsService, public monitor: MonitoringService, public data: DataService) {
    // if (this.ss.finished) {
    //   console.log(this.ss.staticRoomList);
    //   this.dataSource = new MatTableDataSource(this.ss.staticRoomList)
    //   this.dataSource.paginator = this.paginator;
    //   this.dataSource.sort = this.sort;
    //   // console.log(this.ss.allStaticDevices);
    // } else {
    //   this.ss.loaded.subscribe(() => {
    //     console.log(this.ss.staticRoomList);
    //     this.dataSource = new MatTableDataSource(this.ss.staticRoomList)
    //     this.dataSource.paginator = this.paginator;
    //     this.dataSource.sort = this.sort;
    //     // console.log(this.ss.allStaticDevices);
    //   })
    // }
  }

  ngOnInit() {
  }

  //   applyFilter(filterValue: string) {
  //   if (this.dataSource == null) {
  //     return
  //   }
  //   else {
  //     this.dataSource.filter = filterValue.trim().toLowerCase();

  //     if (this.dataSource.paginator) {
  //       this.dataSource.paginator.firstPage();
  //     }
  //   }
  // }

  IsADisplay(deviceID: string): boolean {
    let device = this.data.GetDevice(deviceID)

    if (device != null && device.type != null) {
      return this.data.DeviceHasRole(device, "VideoOut");
    }

    return false;
  }

  DisplayIsOn(deviceID: string): boolean {
    // let dRecord = this.ss.GetSingleStaticDevice(deviceID)

    // if (dRecord != null) {
    //   if (dRecord.power === "on") {
    //     return true
    //   } else {
    //     return false
    //   }
    // }

    return false
  }

}
