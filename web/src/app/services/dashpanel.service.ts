import { Injectable } from '@angular/core';
import { AlertTableComponent } from '../components/dashboard/alerttable/alerttable.component';
import { BatteryReportComponent } from '../components/dashboard/batteryreport/batteryreport.component';
import { DashPanel } from '../components/dashboard/dashpanel/idashpanel';


@Injectable({
  providedIn: 'root'
})
export class DashPanelService {
  private PanelMap = {
    "all-alerts": AlertTableComponent,
    "critical": AlertTableComponent,
    "warning" : AlertTableComponent,
    "battery": BatteryReportComponent 
  }

  getPanel(panelType: string) {
    return new DashPanel(this.PanelMap[panelType]);
  }
}
