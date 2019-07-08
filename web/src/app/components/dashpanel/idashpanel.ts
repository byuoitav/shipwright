import {
  DashpanelTypes,
  DashpanelConfig
} from "src/app/services/dashpanel.service";

export class Dashpanel {
  constructor(public dashPanelConfig: DashpanelConfig) {}
}

export interface IDashPanel {
  info: any;
  chosenSeverity: DashpanelTypes;
}
