import { Injectable } from '@angular/core';
import { AlertTableComponent } from '../components/dashboard/alerttable/alerttable.component';
import { BatteryReportComponent } from '../components/dashboard/batteryreport/batteryreport.component';
import { DashPanel } from '../components/dashboard/dashpanel/idashpanel';


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
  component: any;
  title: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashPanelService {
   getPanel(panelType: DashPanelTypes) : DashPanelConfig {
    
    if (panelType == DashPanelTypes.AllAlerts)
    return {
      component: AlertTableComponent,
      title: "All Alerts"
    };

    if (panelType == DashPanelTypes.CriticalAlerts)
    return {
      component: AlertTableComponent,
      title: "Critical Alerts"
    };

    if (panelType == DashPanelTypes.WarningAlerts)
    return {
      component: AlertTableComponent,
      title: "Warning Alerts"
    };

    if (panelType == DashPanelTypes.LowSeverityAlerts)
    return {
      component: AlertTableComponent,
      title: "Low Severity Alerts"
    };

    if (panelType == DashPanelTypes.RecentlyResolvedAlerts)
    return {
      component: AlertTableComponent,
      title: "Recently Resolved Alerts"
    };

    if (panelType == DashPanelTypes.MaintenanceRoomAlerts)
    return {
      component: AlertTableComponent,
      title: "Maintenance Room Alerts"
    };
    
    return null;
  }
}
