import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { IDashPanel } from '../dashpanel/idashpanel';
import { AlertRow } from 'src/app/objects';
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
  alertRowColumns = ['icon', 'roomID', 'alertCount', 'incident', 'help-sent', 'help-arrived'];
  alertDetailColumns = ['deviceName', 'severity', 'alertType', 'alert-started', 'responders', 'help-sent-at', 'help-arrived-at'];
  expandedAlertRow: AlertRow | null;

  dataSource: MatTableDataSource<AlertRow>;
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

  GetAlertTypes(alertRow: AlertRow) {

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
