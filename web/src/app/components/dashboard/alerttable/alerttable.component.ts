import { Component, OnInit, Input, ViewChild, ChangeDetectorRef } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { IDashPanel } from '../dashpanel/idashpanel';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
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
      state('collapsed', style({height: '0px', minHeight: '0', display: 'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class AlertTableComponent implements OnInit, IDashPanel {
  @Input() chosenSeverity: string;
  @Input() singleRoom: boolean = false;
  roomID: string;
  charCount = 40;

  @Input() expIssue: RoomIssue | null;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  issueData: MatTableDataSource<RoomIssue>;
  selection = new SelectionModel<Alert>(true, []);

  issueColumns: string[] = ["icon", "roomID", "severity", "count", "types", "incident", "help-sent", "help-arrived", "responders"];
  alertColumns: string[] = ["select", "name", "type", "category", "message"];

  private serviceNowURL: string = "https://it.byu.edu/incident.do?sysparm_query=number="

  constructor(public text: StringsService, public data: DataService, private route: ActivatedRoute) {
    if(this.singleRoom) {
      this.route.params.subscribe(par => {
        this.roomID = par["roomID"]
      })

      let issue = this.data.GetRoomIssue(this.roomID);
      
      this.issueData = new MatTableDataSource([issue]);
    } else {
      this.issueData = new MatTableDataSource(this.data.GetRoomIssues(this.chosenSeverity));
    }

    this.issueData.paginator = this.paginator;
    this.issueData.sort = this.sort;
  }

  ngOnInit() {
    if(this.singleRoom) {
      this.route.params.subscribe(par => {
        this.roomID = par["roomID"]
      })

      let issue = this.data.GetRoomIssue(this.roomID);
      
      this.issueData = new MatTableDataSource([issue]);
    } else {
      this.issueData = new MatTableDataSource(this.data.GetRoomIssues(this.chosenSeverity));
    }

    this.issueData.paginator = this.paginator;
    this.issueData.sort = this.sort;
  }

  ExpandRow(issue: RoomIssue) {
    if(!this.singleRoom) {
      if(this.expIssue === issue) {
        this.expIssue = null
      } else {
        this.expIssue = issue
      }
    }
  }

  ServiceNowRedirect(incidentID: string) {
    window.open(this.serviceNowURL+incidentID, "_blank");
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
}
