import { Component, OnInit } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { DataService } from 'src/app/services/data.service';
import { DashPanelTypes } from 'src/app/services/dashpanel.service';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  panelCount;

  constructor(public text: StringsService, public data: DataService) {    
    this.panelCount = Array(this.data.panelCount).fill(1);    
    this.data.settingsChanged.subscribe((value) => {
      this.panelCount = Array(value).fill(1);
    })
  }

  ngOnInit() {
  }

  GetDefaultPanels(index: number): DashPanelTypes {
    if(index == 0) {
      return DashPanelTypes.CriticalAlerts
    } else if(index == 1) {
      return DashPanelTypes.WarningAlerts
    } else {
      return DashPanelTypes.AllAlerts
    }
  }
}
