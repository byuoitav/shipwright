import { Component, OnInit } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { ModalService } from 'src/app/services/modal.service';
import { MonitoringService } from 'src/app/services/monitoring.service';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  panelCount = Array(this.monitor.panelCount).fill(1);

  constructor(public text: StringsService, public monitor: MonitoringService) {
    this.panelCount = Array(this.monitor.panelCount).fill(1);
  }

  ngOnInit() {
  }
}
