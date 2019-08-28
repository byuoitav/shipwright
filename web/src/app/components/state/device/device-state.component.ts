import { Component, OnInit, ViewChild } from "@angular/core";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import {
  MatPaginator,
  MatSort,
  MatTableDataSource,
  MatChipInputEvent
} from "@angular/material";

import { FilterType, Filter } from "../../../objects/filter";
import { SocketService } from "../../../services/socket.service";
import { StaticDevice } from "../../../objects/static";
import { APIService } from "src/app/services/api.service";

@Component({
  selector: "app-device-state",
  templateUrl: "./device-state.component.html",
  styleUrls: ["./device-state.component.scss"]
})
export class DeviceStateComponent implements OnInit {
  readonly separatorKeyCodes: number[] = [ENTER, COMMA]; // delimate filters with these keys
  readonly filterType: typeof FilterType = FilterType; // so the component can use them

  staticDeviceList: StaticDevice[];

  allColumns: string[] = [];
  displayedColumns: string[] = [];
  dataSource: MatTableDataSource<StaticDevice>;
  filters: Filter[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private api: APIService, private socket: SocketService) {}

  ngOnInit() {
    this.load();
  }

  private load() {
    this.api.GetAllStaticDeviceRecords().then(answer => {
      this.staticDeviceList = answer as StaticDevice[];

      this.dataSource = new MatTableDataSource(this.staticDeviceList);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.dataSource.filterPredicate = (
        data: StaticDevice,
        filter: string
      ): boolean => {
        // loop through all the filters, if one of them fails, return false
        for (const f of this.filters) {
          if (!f.filter(data)) {
            return false;
          }
        }

        return true;
      };

      if (this.staticDeviceList && this.staticDeviceList.length > 0) {
        this.allColumns = Object.keys(this.staticDeviceList[0]).sort();
        this.displayedColumns.push(
          ...["deviceID", "deviceType", "power", "input", "lastHeartbeat"]
        );
      }

      // refresh data each time a static device updates
      this.socket.devices.subscribe(device => {
        const idx = this.staticDeviceList.findIndex(
          d => d.deviceID === device.deviceID
        );

        if (idx >= 0) {
          this.staticDeviceList[idx] = device;
        }
        this.dataSource.data = this.staticDeviceList;
      });
    });
  }

  addFilter(ftype: FilterType, key: string, val: string) {
    const f = new Filter(ftype, key, val);
    this.filters.push(f);

    this.forceFilter();
  }

  removeFilter(filter: Filter): void {
    const index = this.filters.indexOf(filter);

    if (index >= 0) {
      this.filters.splice(index, 1);
    }

    this.forceFilter();
  }

  addChip(event: MatChipInputEvent): void {
    const value = event.value.trim();

    let split = value.split(/:(.*)/);
    split = split.filter(s => s); // filter out blank ones
    split = split.map(s => s.trim()); // trim each string

    if (split.length === 2 && this.allColumns.includes(split[0])) {
      this.addFilter(FilterType.For, split[0], split[1]);
    } else {
      this.addFilter(FilterType.General, undefined, value);
    }

    if (event.input) {
      event.input.value = ""; // reset the input
    }
  }

  public forceFilter() {
    if (!this.dataSource.filter && this.filters.length > 0) {
      this.dataSource.filter = "◬";
    }

    this.dataSource._filterData(this.dataSource.data);
    this.dataSource._updateChangeSubscription();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public applyFilter(f: string) {
    this.dataSource.filter = f;

    if (!this.dataSource.filter && this.filters.length > 1) {
      f = "◬";
    }

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public changeCol(o: string, n: string) {
    const index = this.displayedColumns.indexOf(o);
    if (index >= 0) {
      this.displayedColumns[index] = n;
    }
  }
}
