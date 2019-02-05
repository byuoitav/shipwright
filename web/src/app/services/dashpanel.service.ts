import { Injectable } from '@angular/core';
import { AlertTableComponent } from '../components/alerttable/alerttable.component';
import { BatteryReportComponent } from '../components/batteryreport/batteryreport.component';
import { DashPanel } from '../components/dashpanel/idashpanel';


@Injectable({
  providedIn: 'root'
})
export class DashPanelService {
  private PanelMap = {
    "all-alerts": AlertTableComponent,
    "critical-alerts": AlertTableComponent,
    "warning-alerts" : AlertTableComponent,
    "low-alerts" : AlertTableComponent,
    "battery": BatteryReportComponent 
  }

  getPanel(panelType: string, data: any) {
    return new DashPanel(this.PanelMap[panelType], data);
  }
}
