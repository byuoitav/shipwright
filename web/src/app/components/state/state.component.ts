import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import { StaticService } from 'src/app/services/static.service';
import { StaticDevice } from 'src/app/objects';
import { DataService } from 'src/app/services/data.service';

export interface UserData {
  buildingID: string;
  device: string;
  progress: string;
  color: string;
}

/** Constants used to fill up our data base. */
const COLORS: string[] = ['maroon', 'red', 'orange', 'yellow', 'olive', 'green', 'purple',
  'fuchsia', 'lime', 'teal', 'aqua', 'blue', 'navy', 'black', 'gray'];
const NAMES: string[] = ['Maia', 'Asher', 'Olivia', 'Atticus', 'Amelia', 'Jack',
  'Charlotte', 'Theodore', 'Isla', 'Oliver', 'Isabella', 'Jasper',
  'Cora', 'Levi', 'Violet', 'Arthur', 'Mia', 'Thomas', 'Elizabeth'];

/**
 * @title Data table with sorting, pagination, and filtering.
 */
@Component({
  selector: 'state',
  styleUrls: ['state.component.scss'],
  templateUrl: 'state.component.html',
})
export class StateComponent implements OnInit {
  displayedColumns: string[] = ['buildingID', 'device', 'progress', 'color'];
  dataSource: MatTableDataSource<StaticDevice>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private ss: StaticService, private data: DataService) {

    if(this.data.finished) {
      this.dataSource = new MatTableDataSource(this.ss.allStaticDevices)
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      console.log(this.ss.allStaticDevices);
    } else {
      this.data.loaded.subscribe(() => {
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
