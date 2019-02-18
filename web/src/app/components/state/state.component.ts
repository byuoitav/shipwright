import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import { StaticService, FakeStaticRoom } from 'src/app/services/static.service';
import { StaticDevice } from 'src/app/objects';
import { DataService } from 'src/app/services/data.service';
import { StringsService } from 'src/app/services/strings.service';
import { MonitoringService } from 'src/app/services/monitoring.service';

export interface UserData {
  room: string;
  activeSignal: boolean;
  alerts: Int16Array;
  device: string;
  status: string;
  buildingID: string;
}

@Component({
  selector: 'state',
  styleUrls: ['state.component.scss'],
  templateUrl: 'state.component.html',
})
export class StateComponent implements OnInit {
  roomStatusColumns = ['room', 'alerts', 'status'];
  staticDeviceColumns = ['deviceID', 'alerts', 'status'];
  
  dataSource: MatTableDataSource<FakeStaticRoom>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(public ss: StaticService, public data: DataService, public text: StringsService, public monitor: MonitoringService) {

    if(this.ss.finished) {
      this.dataSource = new MatTableDataSource(this.ss.staticRoomList)
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      // console.log(this.ss.allStaticDevices);
    } else {
      this.ss.loaded.subscribe(() => {
        this.dataSource = new MatTableDataSource(this.ss.staticRoomList)
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        // console.log(this.ss.allStaticDevices);
      })
    }

  }

  ngOnInit() {

  }

  applyFilter(filterValue: string) {
    if (this.dataSource == null) {
      return
    }
    else {
      this.dataSource.filter = filterValue.trim().toLowerCase();

      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }
  }

  IsADisplay(deviceID: string): boolean {
    let device = this.data.GetDevice(deviceID)

    if(device != null && device.type != null) {
      return this.data.DeviceHasRole(device, "VideoOut");
    }

    return false;
  }

  DisplayIsOn(deviceID: string): boolean {
    let dRecord = this.ss.GetSingleStaticDevice(deviceID)

    if(dRecord != null) {
      if(dRecord.power === "on") {
        return true
      } else {
        return false
      }
    }
    
    return false
  }

  // TODO: Implement these guys later?
  // addColumn() {
  //   const randomColumn = Math.floor(Math.random() * this.displayedColumns.length);
  //   this.displayedColumns.push(this.displayedColumns[randomColumn]);
  // }

  // removeColumn() {
  //   if (this.displayedColumns.length) {
  //     this.displayedColumns.pop();
  //   }
  // }

}
