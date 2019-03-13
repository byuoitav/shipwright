import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ChangeDetectorRef,
  AfterViewInit,
  OnChanges
} from "@angular/core";
import { StringsService } from "src/app/services/strings.service";
import { IDashPanel, DashPanel } from "../dashpanel/idashpanel";
import {
  MatTableDataSource,
  MatPaginator,
  MatSort,
  SortDirection,
  PageEvent
} from "@angular/material";
import {
  animate,
  state,
  style,
  transition,
  trigger
} from "@angular/animations";
import { ActivatedRoute } from "@angular/router";
import { DataService } from "src/app/services/data.service";
import { RoomIssue, Alert } from "src/app/objects/alerts";
import { DashPanelTypes } from "src/app/services/dashpanel.service";

@Component({
  selector: "app-alert-table",
  templateUrl: "./alerttable.component.html",
  styleUrls: ["./alerttable.component.scss"],
  animations: [
    trigger("detailExpand", [
      state(
        "collapsed",
        style({ height: "0px", minHeight: "0", display: "none" })
      ),
      state("expanded", style({ height: "*" })),
      transition(
        "expanded <=> collapsed",
        animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")
      )
    ])
  ]
})
export class AlertTableComponent
  implements OnInit, IDashPanel, AfterViewInit, OnChanges {
  @Input() info: RoomIssue[] = [];
  @Input() chosenSeverity: DashPanelTypes;
  @Input() singleRoom = false;
  roomID: string;
  charCount = 40;

  @Input() expIssue: RoomIssue | null;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort = new MatSort();

  pageOptions: number[] = [16, 32, 64, 128, 256];
  pageSize = 20;

  // Alert Table's Data
  issueData: MatTableDataSource<RoomIssue>;

  issueColumns: string[] = [
    "icon",
    "roomID",
    "severity",
    "count",
    "types",
    "incident"
  ]; // , "help-sent", "help-arrived", "responders"];
  alertColumns: string[] = [
    "severity-color",
    "name",
    "type",
    "category",
    "message",
    "start-time",
    "end-time"
  ];

  private serviceNowURL =
    "https://ittest.byu.edu/incident.do?sysparm_query=number=";

  constructor(
    public text: StringsService,
    public data: DataService,
    private route: ActivatedRoute,
    private changes: ChangeDetectorRef
  ) {
    if (this.data.finished) {
      this.Setup();
    } else {
      this.data.loaded.subscribe(() => {
        this.Setup();
      });
    }
  }

  ngOnInit() {
    if (this.data.finished) {
      this.Setup();
    } else {
      this.data.loaded.subscribe(() => {
        this.Setup();
      });
    }
  }

  ngAfterViewInit(): void {
    this.issueData.sort = this.sort;
    this.issueData.paginator = this.paginator;
  }

  convertDashPanelTypeToSeverity(dashPanelType: DashPanelTypes): string {
    if (dashPanelType === DashPanelTypes.AllAlerts) {
      return "all";
    } else if (dashPanelType === DashPanelTypes.CriticalAlerts) {
      return "critical";
    } else if (dashPanelType === DashPanelTypes.WarningAlerts) {
      return "warning";
    } else if (dashPanelType === DashPanelTypes.LowSeverityAlerts) {
      return "low";
    }

    return "";
  }

  Setup() {
    // If the table is for a single room, get the room issues for that room
    if (this.singleRoom) {
      this.route.params.subscribe(par => {
        this.roomID = par["roomID"];
      });
      this.issueData = new MatTableDataSource(
        this.data.GetRoomIssues(this.roomID)
      );
    } else {
      // Otherwise, get the issues by severity
      this.issueData = new MatTableDataSource(
        this.data.GetRoomIssuesBySeverity(
          this.convertDashPanelTypeToSeverity(this.chosenSeverity)
        )
      );
    }

    // if (this.sort.active == undefined || this.sort.active == "') {
    //   this.sort.active = "roomID';
    //   this.sort.direction = "asc' as SortDirection;
    //   this.sort.sortChange.emit();
    // }

    this.data.issueEmitter.subscribe(changedIssue => {
      if (!this.changes["destroyed"]) {
        if (this.singleRoom) {
          if (changedIssue.roomID === this.roomID) {
            this.issueData.data = this.data.GetRoomIssues(this.roomID);
          }
        } else {
          this.issueData.data = this.data.GetRoomIssuesBySeverity(
            this.convertDashPanelTypeToSeverity(this.chosenSeverity)
          );
        }

        if (this.sort.active === undefined || this.sort.active === "") {
          this.sort.active = "roomID";
          this.sort.direction = "asc" as SortDirection;
          this.sort.sortChange.emit();
        }

        this.changes.detectChanges();
      }
    });

    this.issueData.sortingDataAccessor = (item, property) => {
      // console.log(item, property);
      switch (property) {
        case "types":
          return this.ArrayToString(item["activeAlertTypes"]);
        default:
          return item[property];
      }
    };
  }

  ngOnChanges() {
    if (!this.changes["destroyed"]) {
      this.changes.detectChanges();
    }
  }

  ExpandRow(issue: RoomIssue) {
    if (!this.singleRoom) {
      if (this.expIssue === issue) {
        this.expIssue = null;
      } else {
        this.expIssue = issue;
      }
    }
  }

  ServiceNowRedirect(incidentID: string) {
    window.open(this.serviceNowURL + incidentID, "_blank");
  }

  GetDeviceName(deviceID: string): string {
    return deviceID.split("-")[2];
  }

  ArrayToString(array: any[]): string {
    if (array == null) {
      return "";
    } else {
      return array.toString();
    }
  }

  TimeIsZero(time: Date): boolean {
    if (time === undefined) {
      return true;
    }
    const zero = "0001-01-01T00:00:00.000Z";

    return time.toISOString() === zero;
  }

  GetReadableTimestamp(time: Date): string {
    const diff = time.valueOf() - new Date().valueOf();
    const duration = Math.abs(Math.trunc((diff / (1000 * 60 * 60)) % 24));
    let answer;

    if (duration >= 1 && duration < 2) {
      answer = duration + " hour ago (" + time.toLocaleTimeString() + ")";
    } else {
      answer = duration + " hours ago (" + time.toLocaleTimeString() + ")";
    }

    return answer;
  }

  OnDefaultTheme(): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("theme")) {
      return urlParams.get("theme") === "default";
    }
  }

  UpdatePage(pageEvent: PageEvent) {
    if (pageEvent.pageSize != null) {
      this.pageSize = pageEvent.pageSize;
    }
  }

  ShouldIExpand(issue: RoomIssue): boolean {
    if (this.expIssue === issue) {
      return true;
    } else {
      return this.singleRoom;
    }
  }

  SortByActiveAlerts(a: Alert, b: Alert): number {
    if (a.active && !b.active) {
      return -1;
    } else if (!a.active && b.active) {
      return 1;
    } else {
      if (a.severity === "Critical" && b.severity != "Critical") {
        return -1;
      } else if (a.severity != "Critical" && b.severity === "Critical") {
        return 1;
      } else if (a.severity === "Warning" && b.severity === "Low") {
        return -1;
      } else if (a.severity === "Low" && b.severity === "Warning") {
        return 1;
      } else {
        return a.deviceID.localeCompare(b.deviceID);
      }
    }
  }
}
