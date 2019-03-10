import { Injectable } from '@angular/core';
import { AlertTableComponent } from '../components/dashboard/alerttable/alerttable.component';

export const enum DashPanelTypes {
  AllAlerts,
  CriticalAlerts,
  WarningAlerts,
  LowSeverityAlerts,
  RecentlyResolvedAlerts,
  MaintenanceRoomAlerts
  //MicrophoneBatteries - someday
  //SuppressedAlerts - someday
}

export class DashPanelConfig {
  dashPanelType: DashPanelTypes;
  component: any;
  title: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashPanelService {
   configs: DashPanelConfig[] = [
    {
      dashPanelType: DashPanelTypes.AllAlerts,
      component: AlertTableComponent,
      title: "All Alerts"
    },
    {
      dashPanelType: DashPanelTypes.CriticalAlerts,
      component: AlertTableComponent,
      title: "Critical Alerts"
    },
    {
      dashPanelType: DashPanelTypes.WarningAlerts,
      component: AlertTableComponent,
      title: "Warning Alerts"
    },
    {
      dashPanelType: DashPanelTypes.LowSeverityAlerts,
      component: AlertTableComponent,
      title: "Low Severity Alerts"
    },
    {
      dashPanelType: DashPanelTypes.RecentlyResolvedAlerts,
      component: AlertTableComponent,
      title: "Recently Resolved Alerts"
    },
    {
      dashPanelType: DashPanelTypes.MaintenanceRoomAlerts,
      component: AlertTableComponent,
      title: "Maintenance Room Alerts"
    },
   ];
  
   getPanel(panelType: DashPanelTypes) : DashPanelConfig {
    return this.configs.find(one => one.dashPanelType == panelType);    
   }

   getAllPanelConfigs() : DashPanelConfig[] {
     return this.configs;
   }
}
