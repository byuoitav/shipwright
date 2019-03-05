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

  // all of the applied filters
  filters: Map<
    string,
    (data: StaticDevice, filter?: string) => boolean
  > = new Map();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private data: DataService) {}

  ngOnInit() {
    this.data.loaded.subscribe(() => {
      this.dataSource = new MatTableDataSource(this.data.staticDeviceList);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.dataSource.filterPredicate = this.filterPred;

      // add generalFilter
      this.filters.set("◬", this.generalFilter);

      console.log("filters", this.filters);

      if (
        this.data.staticDeviceList != null &&
        this.data.staticDeviceList.length > 0
      ) {
        this.allColumns = Object.keys(this.data.staticDeviceList[0]).sort();
        this.displayedColumns.push(...["deviceID", "power", "input"]);
      }
    });
  }

  filterPred = (data: StaticDevice, filter: string): boolean => {
    // loop through all the filters, if one of them fails, return false
    for (const [k, v] of this.filters) {
      if (!v(data, filter)) {
        return false;
      }
    }

    return true;
  };

  generalFilter = (data: StaticDevice, filter: string): boolean => {
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

  applyColumnFilter(col: string, filter: string) {
    const func = (data: StaticDevice): boolean => {
      if (data[col] == null || data[col] === undefined) {
        return false;
      }

      // convert column to string
      const datastr = (data as { [key: string]: any })[col].toLowerCase();

      // trim ending whitespace and turn filter into lowercase
      filter = filter.trim().toLowerCase();

      return datastr.indexOf(filter) !== -1;
    };

    if (filter == null || filter === undefined || filter.length === 0) {
      this.filters.delete(col);
    } else {
      this.filters.set(col, func);
    }

    // console.log("filters", this.filters);
    this.forceFilter();
  }

  public forceFilter() {
    if (!this.dataSource.filter && this.filters.size > 1) {
      this.dataSource.filter = "◬";
    }

    this.dataSource._filterData(this.dataSource.data);
    this.dataSource._updateChangeSubscription();
    console.log("filtered", this.dataSource.filteredData);

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public applyFilter(f: string) {
    this.dataSource.filter = f;

    if (!this.dataSource.filter && this.filters.size > 1) {
      f = "◬";
    }

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public removeColumn(col: string) {
    const idx = this.displayedColumns.indexOf(col, 0);
    if (idx > -1) {
      this.filters.delete(col);
      this.forceFilter();

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
}
