import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { IDashPanel } from '../dashpanel/idashpanel';
import { RoomAlerts, Room } from 'src/app/objects';
import { MonitoringService } from 'src/app/services/monitoring.service';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { ModalService } from 'src/app/services/modal.service';
import {animate, state, style, transition, trigger} from '@angular/animations';

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
  @Input() data: any;
  @Input() singleRoom: boolean = false;
  alertRowColumns = ['icon', 'roomID', 'alertCount', 'incident', 'help-sent', 'help-arrived'];
  alertDetailColumns = ['deviceName', 'severity', 'alertType', 'responders', 'message'];
  @Input() expRoomAlerts: RoomAlerts | null;
  @Input() chosenSeverity: string;

  dataSource: MatTableDataSource<RoomAlerts>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  private serviceNowURL: string = "https://it.byu.edu/incident.do?sysparm_query=number="
  
  constructor(public text: StringsService, public monitor: MonitoringService, public modal: ModalService) { 
  }

  ngOnInit() {
    // console.log(this.data);
    this.dataSource = new MatTableDataSource(this.data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnChanges() {
   
  }

  ExpandRow(row: RoomAlerts) {
    if(!this.singleRoom) {
      if(this.expRoomAlerts === row) {
        this.expRoomAlerts = null
      }
      else {
        this.expRoomAlerts = row
      }
    }
  }

  GetAlertTypes(alertRow: Room) {

  }

  GetAlertCount(ra: RoomAlerts) {
    let count = 0;

    for(let alert of ra.alerts) {
      if(alert.severity === this.chosenSeverity) {
        count++;
      }
    }

    return count
  }

  SeverityMatch(sev: string): boolean {
    if(this.chosenSeverity == null || this.chosenSeverity.length == 0) {
      return true
    }
    
    return (sev === this.chosenSeverity);
  }
  ServiceNowRedirect(incidentID: string) {
    window.open(this.serviceNowURL+incidentID, "_blank");
  }

  GetDeviceName(deviceID: string): string {
    // console.log(new Date().toLocaleString())
    return deviceID.split("-")[2];
  }

  GetReadableTimestamp(timestamp: string): string {
    // console.log(timestamp);

    let dateString = timestamp.split(",")[0]
    let timeString = timestamp.split(",")[1]

    let finalDate = dateString.substring(0, dateString.lastIndexOf("/"))
    let finalTime = timeString.substring(0, timeString.lastIndexOf(":")) + timeString.substring(timeString.lastIndexOf(" "));

    return finalDate + finalTime;
  }
}
