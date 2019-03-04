import { Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator, MatSort, MatTableDataSource } from "@angular/material";

import { DataService } from "../../../services/data.service";
import { StaticDevice } from "../../../objects/static";

@Component({
  selector: "app-device-state",
  templateUrl: "./device-state.component.html",
  styleUrls: ["./device-state.component.scss"]
})
export class DeviceStateComponent implements OnInit {
  allColumns: string[] = [];
  displayedColumns: string[] = [];

  dataSource: MatTableDataSource<StaticDevice>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private data: DataService) {}

  ngOnInit() {
    this.data.loaded.subscribe(() => {
      this.dataSource = new MatTableDataSource(this.data.staticDeviceList);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.dataSource.filterPredicate = this.filterPred;

      if (
        this.data.staticDeviceList != null &&
        this.data.staticDeviceList.length > 0
      ) {
        this.allColumns = Object.keys(this.data.staticDeviceList[0]).sort();
        this.displayedColumns.push(...["deviceID", "power", "input"]);
      }

      console.log("deviceList", this.data.staticDeviceList);
    });
  }

  filterPred = (data: StaticDevice, filter: string) => {
    const datastr = Object.keys(data)
      .reduce((currentTerm: string, key: string) => {
        if (data[key] == null || data[key] === undefined) {
          return currentTerm;
        }

        return currentTerm + (data as { [key: string]: any })[key] + "◬";
      }, "")
      .toLowerCase();

    // trim ending whitespace and turn filter into lowercase
    filter = filter.trim().toLowerCase();

    // assume filter string is a space delimated set of AND's
    const split = filter.split(" ");

    for (const term of split) {
      if (datastr.indexOf(term) < 0) {
        return false;
      }
    }

    return true;
  };

  public removeColumn(col: string) {
    const idx = this.displayedColumns.indexOf(col, 0);
    if (idx > -1) {
      this.displayedColumns.splice(idx, 1);
    }
  }

  public addColumn(col: string) {
    this.displayedColumns.push(col);
  }

  public shiftLeft(col: string) {
    const idx = this.displayedColumns.indexOf(col);

    if (idx <= 0) {
      return;
    }

    const swap = this.displayedColumns[idx];
    this.displayedColumns[idx] = this.displayedColumns[idx - 1];
    this.displayedColumns[idx - 1] = swap;
  }

  public applyFilter(f: string) {
    this.dataSource.filter = f.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
