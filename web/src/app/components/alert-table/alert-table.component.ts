import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { APIService } from "src/app/services/api.service";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { RoomIssue } from "src/app/objects/alerts";
import {
  animate,
  state,
  style,
  transition,
  trigger
} from "@angular/animations";
import { Router } from "@angular/router";
import {
  MatPaginator,
  MatSort,
  MatTableDataSource,
  MatChipInputEvent
} from "@angular/material";

import { FilterType, Filter, FilterSet } from "../../objects/filter";
import { DashpanelTypes } from "../dashpanel/idashpanel";

@Component({
  selector: "alert-table",
  templateUrl: "./alert-table.component.html",
  styleUrls: ["./alert-table.component.scss"],
  animations: [
    trigger("detailExpand", [
      state("collapsed", style({ height: "0px", minHeight: "0" })),
      state("expanded", style({ height: "*" })),
      transition(
        "expanded <=> collapsed",
        animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")
      )
    ])
  ]
})
export class AlertTableComponent implements OnInit {
  readonly separatorKeyCodes: number[] = [ENTER, COMMA]; // delimate filters with these keys
  readonly filterType: typeof FilterType = FilterType; // so the component can use them

  @Input() singleRoom = false;
  @Input() roomID: string;
  // @Input() chosenType: DashpanelTypes;

  issues: RoomIssue[];
  expandedIssue: RoomIssue | null;

  dataSource: MatTableDataSource<RoomIssue>;
  filters: FilterSet<RoomIssue>;
  // filters: Filter[] = [];

  issueCols = ["systemType", "roomID", "count", "age", "lastNote"];

  alertCols = ["deviceID", "type", "message", "startTime"];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(public api: APIService, public router: Router) {}

  ngOnInit() {
    this.api.GetAllIssues().then(answer => {
      this.issues = answer as RoomIssue[];
      console.log("issues", this.issues);
      this.dataSource = new MatTableDataSource(this.issues);

      // because of the ngIf on the parent container
      setTimeout(() => {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSource.sortingDataAccessor = (
          data: RoomIssue,
          headerID: string
        ) => {
          switch (headerID) {
            case "age":
              return data.oldestActiveAlert.startTime;
            case "count":
              return data.activeAlertCount;
            default:
              return data[headerID];
          }
        };

        this.filters = new FilterSet(this.dataSource);
      });
    });
  }

  goToAlerts(roomID: string) {
    this.router.navigate(["/campus/" + roomID + "/tab/2"]);
  }

  getTotalActiveAlertCount() {
    let count = 0;

    if (this.dataSource && this.dataSource.filteredData) {
      for (const issue of this.dataSource.filteredData) {
        if (issue.activeAlertCount) {
          count += issue.activeAlertCount;
        }
      }
    }

    return count;
  }
}
