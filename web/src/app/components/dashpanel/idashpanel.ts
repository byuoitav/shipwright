import {
  DashpanelConfig
} from "src/app/services/dashpanel.service";

export class Dashpanel {
  constructor(public dashPanelConfig: DashpanelConfig) {}
}

export interface IDashPanel {
  info: any;
  chosenSeverity: DashpanelTypes;
}

export enum DashpanelTypes {
  AllAlerts,
  CriticalAlerts,
  WarningAlerts,
  LowSeverityAlerts,
  RecentlyResolvedAlerts,
  MaintenanceRoomAlerts,
  StageDevAlerts
}

export namespace DashpanelTypes {
  export function toString(t: DashpanelTypes): string {
    switch (t) {
      case DashpanelTypes.AllAlerts:
        return "All";
      case DashpanelTypes.CriticalAlerts:
        return "Critical";
      case DashpanelTypes.WarningAlerts:
        return "Warning";
      case DashpanelTypes.LowSeverityAlerts:
        return "Low";
      case DashpanelTypes.RecentlyResolvedAlerts:
        return "Recently Resolved";
      case DashpanelTypes.MaintenanceRoomAlerts:
        return "Maintenance";
      case DashpanelTypes.StageDevAlerts:
        return "Stage/Dev";
      default:
        return "";
    }
  }
}