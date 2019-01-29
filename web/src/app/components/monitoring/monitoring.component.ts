import { Component, OnInit, ViewChild } from '@angular/core';
import { MonitoringService } from 'src/app/services/monitoring.service';
import { StringsService } from 'src/app/services/strings.service';
import { AlertRow, Alert } from 'src/app/objects';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { APIService } from 'src/app/services/api.service';
import { ModalService } from 'src/app/services/modal.service';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';

@Component({
  selector: 'monitoring',
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display: 'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class MonitoringComponent implements OnInit {
  alertRowColumns = ['icon', 'roomID', 'alertCount', 'alertTypes', 'incident', 'help-sent', 'help-arrived', 'respond'];
  alertDetailColumns = ['deviceID', 'alertType', 'severity', 'message', 'alert-started', 'alert-resolved', 'responders', 'help-sent-at', 'help-arrived-at'];
  expandedAlertRow: AlertRow | null;

  dataSource: MatTableDataSource<AlertRow>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  private serviceNowURL: string = "https://it.byu.edu/incident.do?sysparm_query=number=";

  constructor(public monitor: MonitoringService, public text: StringsService, public api: APIService, public popup: ModalService) {
    this.dataSource = new MatTableDataSource(monitor.alertRowList);
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ServiceNowRedirect(incidentID: string) {
    window.open(this.serviceNowURL+incidentID, "_blank");
  }

  ApplyFilter(filterValue: string) {
    console.log(filterValue);
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}
