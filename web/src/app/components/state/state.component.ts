import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import { StaticService } from 'src/app/services/static.service';
import { StaticDevice } from 'src/app/objects';
import { DataService } from 'src/app/services/data.service';

export interface UserData {
  room: string;
  activeSignal: boolean;
  alerts: Int16Array;
  device: string;
  status: string;
  buildingID: string;
}

/**
 * @title Data table with sorting, pagination, and filtering.
 */
@Component({
  selector: 'state',
  styleUrls: ['state.component.scss'],
  templateUrl: 'state.component.html',
})
export class StateComponent implements OnInit {
  displayedColumns: string[] = ['room', 'alerts', 'status'];
  dataSource: MatTableDataSource<StaticDevice>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private ss: StaticService, private data: DataService) {

    if(this.ss.finished) {
      this.dataSource = new MatTableDataSource(this.ss.allStaticDevices)
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      console.log(this.ss.allStaticDevices);
    } else {
      this.ss.loaded.subscribe(() => {
        this.dataSource = new MatTableDataSource(this.ss.allStaticDevices)
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        console.log(this.ss.allStaticDevices);
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
}
