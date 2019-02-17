import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { StringsService } from 'src/app/services/strings.service';
import { StaticService, FakeStaticRoom } from 'src/app/services/static.service';
import { MonitoringService } from 'src/app/services/monitoring.service';
import { DataService } from 'src/app/services/data.service';
import { StaticDevice } from 'src/app/objects';

@Component({
  selector: 'campus-state',
  templateUrl: './campus-state.component.html',
  styleUrls: ['./campus-state.component.scss']
})
export class CampusStateComponent implements OnInit {
  stateColumns = ['room', 'alerts', 'status'];

  dataSource: MatTableDataSource<FakeStaticRoom>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(public text: StringsService, public ss: StaticService, public monitor: MonitoringService, public data: DataService) {
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

}
