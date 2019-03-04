import { Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator, MatSort, MatTableDataSource } from "@angular/material";

import { DataService } from "../../../services/data.service";
import { StaticDevice } from "../../../objects/state";

@Component({
  selector: "app-device-state",
  templateUrl: "./device-state.component.html",
  styleUrls: ["./device-state.component.scss"]
})
export class DeviceStateComponent implements OnInit {
  allColumns: string[] = ["deviceID", "input", "room", "modelName", "power"];
  displayedColumns: string[] = ["deviceID", "power", "input"];

  dataSource: MatTableDataSource<StaticDevice[]>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private data: DataService) {}

  ngOnInit() {
    this.data.loaded.subscribe(() => {
      this.dataSource = new MatTableDataSource(this.data.staticDeviceList);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      console.log("deviceList", this.data.staticDeviceList);
    });
  }

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

  public diff<T>(a1: T[], a2: T[]): T[] {
    return a1.filter(i => {
      return a2.indexOf(i) < 0;
    });
  }
}
