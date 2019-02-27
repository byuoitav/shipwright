import { Component, OnInit, Input, ViewChild, ChangeDetectorRef } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { IDashPanel } from '../dashpanel/idashpanel';
import { MatTableDataSource, MatPaginator, MatSort, PageEvent } from '@angular/material';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { RoomIssue, Alert } from 'src/app/objects/alerts';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'alert-table',
  templateUrl: './alerttable.component.html',
  styleUrls: ['./alerttable.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class AlertTableComponent implements OnInit, IDashPanel {
  @Input() info: RoomIssue[] = [];
  @Input() chosenSeverity: string;
  @Input() singleRoom: boolean = false;
  roomID: string;
  charCount = 40;

  @Input() expIssue: RoomIssue | null;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  pageOptions: number[] = [5, 10, 15, 20, 25, 30, 50, 100];
  pageSize: number = 20;

  issueData: MatTableDataSource<RoomIssue>;
  selection = new SelectionModel<Alert>(true, []);

  issueColumns: string[] = ["icon", "roomID", "severity", "count", "types", "incident"];//, "help-sent", "help-arrived", "responders"];
  alertColumns: string[] = ["select", "name", "type", "category", "message", "start-time", "end-time"];

  private serviceNowURL: string = "https://ittest.byu.edu/incident.do?sysparm_query=number="

  constructor(public text: StringsService, public data: DataService, private route: ActivatedRoute, private changes: ChangeDetectorRef) {
    if(this.data.finished) {
      this.Setup();
    } else {
      this.data.loaded.subscribe(() => {
        this.Setup();
      })
    }
  }

  ngOnInit() {
    if(this.data.finished) {
      this.Setup();
    } else {
      this.data.loaded.subscribe(() => {
        this.Setup();
      })
    }
  }

  ngAfterViewInit(): void {
    this.issueData.sort = this.sort;
    this.issueData.paginator = this.paginator;
  }

  Setup() {
    if(this.singleRoom) {
      this.route.params.subscribe(par => {
        this.roomID = par["roomID"];
      })
      this.issueData = new MatTableDataSource(this.data.GetRoomIssues(this.roomID));
    } else {
      this.issueData = new MatTableDataSource(this.data.GetRoomIssuesBySeverity(this.chosenSeverity));
    }

    this.data.issueEmitter.subscribe(() => {
      if(!this.changes['destroyed']) {
        this.changes.detectChanges();
      }
    })

    this.issueData.sortingDataAccessor = (item, property) => {
      //console.log(item, property);
      switch (property) {
          case 'types': return this.ArrayToString(item["activeAlertTypes"]);
          default: return item[property];
      }
     }
  }

  ngOnChanges() {
    if(this.chosenSeverity != null) {
      this.issueData.data = this.data.GetRoomIssues(this.chosenSeverity);

      if(!this.changes['destroyed']) {
        this.changes.detectChanges();
      }
    }
  }

  ExpandRow(issue: RoomIssue) {
    if (!this.singleRoom) {
      if (this.expIssue === issue) {
        this.expIssue = null
      } else {
        this.expIssue = issue
      }
    }
  }

  ServiceNowRedirect(incidentID: string) {
    window.open(this.serviceNowURL + incidentID, "_blank");
  }

  IsAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.issueData.data[0].alerts.length;
    return numSelected === numRows;
  }

  MasterToggle() {
    this.IsAllSelected() ?
      this.selection.clear() :
      this.issueData.data[0].alerts.forEach(alert => this.selection.select(alert));
  }

  GetDeviceName(deviceID: string): string {
    return deviceID.split("-")[2];
  }

  ArrayToString(array: any[]): string {
    if (array == null) {
      return ""
    } else {
      return array.toString();
    }
  }

  TimeIsZero(time: Date): boolean  {
    if (time == undefined){
      return true;
    }
    let zero = "0001-01-01T00:00:00.000Z";

    return time.toISOString() === zero;
  }

  GetReadableTimestamp(time: Date): string {
    let diff = time.valueOf() - new Date().valueOf();
    let duration = Math.abs(Math.trunc((diff / (1000*60*60)) % 24));
    let answer;
    
    if(duration >= 1 && duration < 2) {
      answer = duration + " hour ago (" + time.toLocaleTimeString() + ")"
    } else {
      answer = duration + " hours ago (" + time.toLocaleTimeString() + ")"
    }
    
    return answer
  }

  OnDefaultTheme(): boolean {
    let urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("theme")) {
      return urlParams.get("theme") == "default"
    }
  }

  UpdatePage(pageEvent: PageEvent) {
    if(pageEvent.pageSize != null) {
      this.pageSize = pageEvent.pageSize;
    }
  }
}
