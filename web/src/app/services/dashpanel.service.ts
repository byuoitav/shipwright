import { Injectable } from "@angular/core";
import { AlertTableComponent } from "../components/alert-table/alert-table.component";

export const enum DashpanelTypes {
  AllAlerts,
  CriticalAlerts,
  WarningAlerts,
  LowSeverityAlerts,
  RecentlyResolvedAlerts,
  MaintenanceRoomAlerts,
  StageDevAlerts
}

export class DashpanelConfig {
  dashPanelType: DashpanelTypes;
  component: any;
  title: string;
}

@Injectable({
  providedIn: "root"
})
export class DashpanelService {
  configs: DashpanelConfig[] = [
    {
      dashPanelType: DashpanelTypes.AllAlerts,
      component: AlertTableComponent,
      title: "All Alerts"
    },
    {
      dashPanelType: DashpanelTypes.CriticalAlerts,
      component: AlertTableComponent,
      title: "Critical Alerts"
    },
    {
      dashPanelType: DashpanelTypes.WarningAlerts,
      component: AlertTableComponent,
      title: "Warning Alerts"
    },
    {
      dashPanelType: DashpanelTypes.LowSeverityAlerts,
      component: AlertTableComponent,
      title: "Low Severity Alerts"
    },
    {
      dashPanelType: DashpanelTypes.RecentlyResolvedAlerts,
      component: AlertTableComponent,
      title: "Recently Resolved Alerts"
    },
    {
      dashPanelType: DashpanelTypes.MaintenanceRoomAlerts,
      component: AlertTableComponent,
      title: "Maintenance Room Alerts"
    },
    {
      dashPanelType: DashpanelTypes.StageDevAlerts,
      component: AlertTableComponent,
      title: "Stage and Development Room Alerts"
    }
  ];

  getPanel(panelType: DashpanelTypes): DashpanelConfig {
    return this.configs.find(one => one.dashPanelType === panelType);
  }

  getAllPanelConfigs(): DashpanelConfig[] {
    return this.configs;
  }
}
