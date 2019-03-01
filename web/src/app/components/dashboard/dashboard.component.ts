import { Component, OnInit } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { DataService } from 'src/app/services/data.service';
import { DashPanelTypes } from 'src/app/services/dashpanel.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  panelCount: number;  

  constructor(public text: StringsService, public data: DataService, public modal: ModalService) {    
    this.panelCount = data.panelCount;
    data.settingsChanged.subscribe(() => this.panelCount = data.panelCount);
  }

  ngOnInit() {
  }

  GetDefaultPanels(index: number): DashPanelTypes {
    if(index == 0) {
      return DashPanelTypes.CriticalAlerts
    } else if(index == 1) {
      return DashPanelTypes.LowSeverityAlerts
    } else if (index == 2) {
      return DashPanelTypes.WarningAlerts
    } else if (index == 3) {
      return DashPanelTypes.RecentlyResolvedAlerts
    }

  }
}
