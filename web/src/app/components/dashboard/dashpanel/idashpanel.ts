import { Type } from "@angular/core";
import {
  DashPanelTypes,
  DashPanelConfig
} from "src/app/services/dashpanel.service";

export class DashPanel {
  constructor(public dashPanelConfig: DashPanelConfig) {}
}

export interface IDashPanel {
  info: any;
  chosenSeverity: DashPanelTypes;
}
