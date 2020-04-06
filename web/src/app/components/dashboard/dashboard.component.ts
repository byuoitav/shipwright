import { Component, OnInit } from "@angular/core";
import { DashpanelTypes } from '../dashpanel/idashpanel';

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"]
})
export class DashboardComponent implements OnInit {
  panelCount: number;
  panels = [0];
  layouts = ["view_stream", "view_column", "view_module"];
  selectedLayout = this.layouts[0];

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

  addPanel() {
    this.panels.push(0);
  }

  removePanel() {
    if (this.panels.length > 1) {
      this.panels.pop();
    }
  }

  chooseLayout(layout: string) {
    this.selectedLayout = layout;
  }
}
