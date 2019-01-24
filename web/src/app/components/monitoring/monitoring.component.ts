import { Component, OnInit } from '@angular/core';
import { MonitoringService } from 'src/app/services/monitoring.service';
import { StringsService } from 'src/app/services/strings.service';
import { AlertRow } from 'src/app/objects';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { APIService } from 'src/app/services/api.service';

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

  constructor(public monitor: MonitoringService, public text: StringsService, public api: APIService) { }

  ngOnInit() {
  }

}
