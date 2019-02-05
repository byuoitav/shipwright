import { Component, OnInit, NgZone } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { ModalService } from 'src/app/services/modal.service';
import { MonitoringService } from 'src/app/services/monitoring.service';
import { SettingsModalComponent } from 'src/app/modals/settings/settings.component';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  panelCount;

  constructor(public text: StringsService, public monitor: MonitoringService, private zone: NgZone) {
    this.panelCount = Array(this.monitor.panelCount).fill(1);
    this.monitor.settingsChanged.subscribe((value) => {
      this.panelCount = Array(value).fill(1);
    })
  }

  ngOnInit() {
  }

  SetPanelCount(value: number) {
    
  }
}
