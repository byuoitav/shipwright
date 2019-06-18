import {
  Component,
  OnInit,
  Input,
  ViewChild,
  AfterViewInit
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
import { RoomIssue, Alert, ClassSchedule } from "src/app/objects/alerts";
import { DashPanelTypes } from "src/app/services/dashpanel.service";
import { stringify } from '@angular/core/src/util';
import { APIService } from 'src/app/services/api.service';
import { timeInterval } from 'rxjs/operators';

declare var roomAvailability: string;
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

export class AlertTableComponent implements OnInit, IDashPanel, AfterViewInit {
  @Input() info: RoomIssue[] = [];
  @Input() chosenSeverity: DashPanelTypes;
  @Input() singleRoom = false;
  roomID: string;
  charCount = 40;
  scheduleMap: Map<string, ClassSchedule[]>

  @Input() expIssue: RoomIssue | null;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort = new MatSort();

  pageOptions: number[] = [16, 32, 64, 128, 256];
  pageSize = 32;

  // Alert Table's Data
  issueData: MatTableDataSource<RoomIssue>;

  issueColumns: string[] = [
    "icon",
    "roomID",
    "severity",
    "count",
    "types",
    "incident",
    //"availabilty",
    "lastnote"
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
    public api: APIService
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
    // if (this.data.finished) {
    //   this.Setup();
    // } else {
    //   this.data.loaded.subscribe(() => {
    //     this.Setup();
    //   });
    // }
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
    } else if (dashPanelType === DashPanelTypes.StageDevAlerts) {
      return "development";
    }

    return "";
  }

  Setup() {
    let issueList: RoomIssue[];
    // If the table is for a single room, get the room issues for that room
    if (this.singleRoom) {
      this.route.params.subscribe(par => {
        this.roomID = par["roomID"];
      });
      issueList = this.data.GetRoomIssues(this.roomID);
      this.issueData = new MatTableDataSource(
        issueList
      );
    } else {
      // Otherwise, get the issues by severity
      issueList = this.data.GetRoomIssuesBySeverity(
        this.convertDashPanelTypeToSeverity(this.chosenSeverity)
      );
      this.issueData = new MatTableDataSource(
        issueList
      );
      this.GetIssueAge(this.data.GetRoomIssue("BNSN-W005"));
    }

    this.data.issueEmitter.subscribe(changedIssue => {
      if (this.singleRoom) {
        if (
          changedIssue != null &&
          changedIssue !== undefined &&
          changedIssue.roomID === this.roomID
        ) {
          this.issueData.data = [changedIssue];
        }
      } else {
        issueList = this.data.GetRoomIssuesBySeverity(
          this.convertDashPanelTypeToSeverity(this.chosenSeverity)
        );
        this.issueData.data = issueList;
      }

      if (this.sort.active === undefined || this.sort.active === "") {
        this.sort.active = "roomID";
        this.sort.direction = "asc" as SortDirection;
        this.sort.sortChange.emit();
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

    // this.scheduleMap = new Map();
    // console.log("here it is ", issueList);
    // for (const issue of issueList) {
    //   console.log("Here's the room ID ", issue.roomID);
    //   this.api.GetClassSchedule(issue.roomID).then((schedule) => {
    //     console.log("wait here's a message ", schedule);
    //     const s = schedule as ClassSchedule[];
    //     this.scheduleMap.set(issue.roomID, s);
    //   })
    // }
    // console.log("I'm the map, I'm the map, I'm the map, I'm the map, I'm the map!", this.scheduleMap);

    //this.api.GetClassSchedule("BNSN-W140").then((schedule) => {
    //   this.api.GetClassSchedule("BNSN-W009").then((schedule) => {
    //   console.log("Here is the schedule ", schedule)
    //   console.log("can we get class time?", schedule[0].classTime)
    // })

    
   // this.ExtractClassSchedule(this.roomID);
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

  GetReadableTimestamp(time: Date, withTime: boolean): string {
    const diff = new Date().valueOf() - time.valueOf();
    // const duration = Math.abs(Math.trunc((diff / (1000 * 60 * 60)) % 24));
    let answer;

    const minutes = Math.abs(Math.floor(( diff / (1000 * 60)) % 60));
    const hours   = Math.abs(Math.floor(( diff / (1000 * 60 * 60)) % 24));
    const days = Math.abs(Math.floor((diff / (1000 * 60 * 60 * 24))));
    // format age 1d 2h 3m
    if (withTime) {
      if (days == 0)
      {
        if (hours == 0) {
          answer = minutes.toString() + "m ago (" + time.toLocaleTimeString() + ")";
        }
        else { 
          answer = hours.toString() + "h " + minutes.toString() + "m ago (" + time.toLocaleTimeString() + ")";
        }
      }
      else {
        answer = days.toString() + "d " + hours.toString() + "h " + minutes.toString() + "m ago (" + time.toLocaleTimeString() + ")";
      }
    } else {
      if (days == 0)
      {
        if (hours == 0) {
          answer = minutes.toString() + "m";
        }
        else { 
          answer = hours.toString() + "h " + minutes.toString() + "m ago";
        }
      }
      else {
        answer = days.toString() + "d " + hours.toString() + "h " + minutes.toString() + "m ago";

      }
    }
    return answer;
  }

  GetIssueAge(issue: RoomIssue) {
    if (issue == null) {
      return
    }
    // loop through each alert
    let oldestalert = new Date();
    // find oldest start time
    for (const alert of issue.alerts) {
      if (alert.startTime < oldestalert) {
        oldestalert = alert.startTime;
      }
    }
    return this.GetReadableTimestamp(oldestalert, false);
  }

  GetIssuecolor(issue: RoomIssue) {
    // find oldest start time
    const severitytypes = ["Critical", "Warning", "Low"];
    let classname = "";
    for (const sev of severitytypes) {
      for (const severity of issue.activeAlertSeverities) {
        if (severity === sev) {
          classname += sev + "-";
        }
      }
    }
    classname += "indicator";
    return classname;
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

  ExtractNoteInfo(note: string): string {
    if (note == null) {
      return "";
    }
    let s = note;
    s = s.substring(s.indexOf("|") + 1);
    if (s.length > 40) {
      s = s.substring(0, 39);
    }
    return s;
  }

  // ExtractClassSchedule(room: string) {
  //   //return "Available";
  //   let schedule: ClassSchedule[];
  //   //return "Available";
  //   this.api.GetClassSchedule(room).then((response) => {
  //     schedule = response;
  //   })
  //   console.log("is anything here", schedule);
  //   // if (schedule == null) {
  //   //   return "";
  //   // }
  //   // let d = new Date();
  //   // let today = d.getDay();
  //   // switch (today) {
  //   //   case 1: {
  //   //     for (let i =0; schedule.length; i++) {
  //   //       if (schedule[i].days.includes("M") || schedule[i].days.includes("Daily")) {
  //   //         let rn = "";
  //   //         if (d.getHours() == 12) {
  //   //           rn = d.getHours() + ":" + d.getMinutes() + "p";
  //   //         }
  //   //         else if (d.getHours() > 12) {
  //   //           let stdhours = d.getHours() -12;
  //   //           rn = stdhours + ":" + d.getMinutes() + "p";
  //   //         }
  //   //         else {
  //   //           rn = d.getHours() + ":" + d.getMinutes() + "a";
  //   //         }
  //   //         let ct: string[] = schedule[i].classTime.split(" ");
  //   //         let ctStart = ct[0];
  //   //         let ctEnd = ct[2];
  //   //         if (rn > ctStart && ctEnd > rn) {
  //   //           return ctEnd;
  //   //         }
  //   //         else {
  //   //           return "Available";
  //   //         }
  //   //       }
  //   //     }
  //   //     return "Available";
  //   //   }
  //   //   case 2: {
  //   //     for (let i =0; schedule.length; i++) {
  //   //       //figure out T/Th
  //   //       if (schedule[i].days.includes("T") || schedule[i].days.includes("Daily")) {
  //   //         let rn = "";
  //   //         if (d.getHours() == 12) {
  //   //           rn = d.getHours() + ":" + d.getMinutes() + "p";
  //   //         }
  //   //         else if (d.getHours() > 12) {
  //   //           let stdhours = d.getHours() -12;
  //   //           rn = stdhours + ":" + d.getMinutes() + "p";
  //   //         }
  //   //         else {
  //   //           rn = d.getHours() + ":" + d.getMinutes() + "a";
  //   //         }
  //   //         let ct: string[] = schedule[i].classTime.split(" ");
  //   //         let ctStart = ct[0];
  //   //         let ctEnd = ct[2];
  //   //         if (rn > ctStart && ctEnd > rn) {
  //   //           return ctEnd;
  //   //         }
  //   //         else {
  //   //           return "Available";
  //   //         }
  //   //       }
  //   //     }
  //   //     return "Available";
  //   //   }
  //   //   case 3: {
  //   //     for (let i =0; schedule.length; i++) {
  //   //       if (schedule[i].days.includes("W") || schedule[i].days.includes("Daily")) {
  //   //         let rn = "";
  //   //         if (d.getHours() == 12) {
  //   //           rn = d.getHours() + ":" + d.getMinutes() + "p";
  //   //         }
  //   //         else if (d.getHours() > 12) {
  //   //           let stdhours = d.getHours() -12;
  //   //           rn = stdhours + ":" + d.getMinutes() + "p";
  //   //         }
  //   //         else {
  //   //           rn = d.getHours() + ":" + d.getMinutes() + "a";
  //   //         }
  //   //         let ct: string[] = schedule[i].classTime.split(" ");
  //   //         let ctStart = ct[0];
  //   //         let ctEnd = ct[2];
  //   //         if (rn > ctStart && ctEnd > rn) {
  //   //           return ctEnd;
  //   //         }
  //   //         else {
  //   //           return "Available";
  //   //         }
  //   //       }
  //   //     }
  //   //     return "Available";
  //   //   }
  //   //   case 4: {
  //   //     for (let i =0; schedule.length; i++) {
  //   //       //figure out T/Th
  //   //       if (schedule[i].days.includes("Th") || schedule[i].days.includes("Daily")) {
  //   //         let rn = "";
  //   //         if (d.getHours() == 12) {
  //   //           rn = d.getHours() + ":" + d.getMinutes() + "p";
  //   //         }
  //   //         else if (d.getHours() > 12) {
  //   //           let stdhours = d.getHours() -12;
  //   //           rn = stdhours + ":" + d.getMinutes() + "p";
  //   //         }
  //   //         else {
  //   //           rn = d.getHours() + ":" + d.getMinutes() + "a";
  //   //         }
  //   //         let ct: string[] = schedule[i].classTime.split(" ");
  //   //         let ctStart = ct[0];
  //   //         let ctEnd = ct[2];
  //   //         if (rn > ctStart && ctEnd > rn) {
  //   //           return ctEnd;
  //   //         }
  //   //         else {
  //   //           return "Available";
  //   //         }
  //   //       }
  //   //     }
  //   //     return "Available";
  //   //   }
  //   //   case 5: {
  //   //     for (let i =0; schedule.length; i++) {
  //   //       if (schedule[i].days.includes("F") || schedule[i].days.includes("Daily")) {
  //   //         let rn = "";
  //   //         if (d.getHours() == 12) {
  //   //           rn = d.getHours() + ":" + d.getMinutes() + "p";
  //   //         }
  //   //         else if (d.getHours() > 12) {
  //   //           let stdhours = d.getHours() -12;
  //   //           rn = stdhours + ":" + d.getMinutes() + "p";
  //   //         }
  //   //         else {
  //   //           rn = d.getHours() + ":" + d.getMinutes() + "a";
  //   //         }
  //   //         let ct: string[] = schedule[i].classTime.split(" ");
  //   //         let ctStart = ct[0];
  //   //         let ctEnd = ct[2];
  //   //         if (rn > ctStart && ctEnd > rn) {
  //   //           return ctEnd;
  //   //         }
  //   //         else {
  //   //           return "Available";
  //   //         }
  //   //       }
  //   //     }
  //   //     return "Available";
  //   //   }
  //   // }
  // }

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
      if (a.severity === "Critical" && b.severity !== "Critical") {
        return -1;
      } else if (a.severity !== "Critical" && b.severity === "Critical") {
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
