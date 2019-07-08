import { Component, OnInit } from "@angular/core";
import { DashpanelTypes } from "src/app/services/dashpanel.service";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"]
})
export class DashboardComponent implements OnInit {
  panelCount: number;

  constructor() {
  }

  ngOnInit() {
  }

  getDefaultPanels(index: number): DashpanelTypes {
    if (index === 0) {
      return DashpanelTypes.CriticalAlerts;
    } else if (index === 1) {
      return DashpanelTypes.LowSeverityAlerts;
    } else if (index === 2) {
      return DashpanelTypes.WarningAlerts;
    } else if (index === 3) {
      return DashpanelTypes.RecentlyResolvedAlerts;
    }
  }
}
