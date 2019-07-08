import { Component, OnInit, ViewChild, forwardRef, Input, ComponentFactoryResolver } from "@angular/core";
import { DashpanelDirective } from "./dashpanel.directive";
import { DashpanelTypes, DashpanelConfig, DashpanelService } from "src/app/services/dashpanel.service";
import { IDashPanel } from "./idashpanel";

@Component({
  selector: "dashpanel",
  templateUrl: "./dashpanel.component.html",
  styleUrls: ["./dashpanel.component.scss"]
})
export class DashpanelComponent implements OnInit {
  @ViewChild(forwardRef(() => DashpanelDirective)) direct: DashpanelDirective;
  @Input() panelType: DashpanelTypes;
  possiblePanels: DashpanelConfig[];
  selectedPanel: DashpanelConfig;

  constructor(
    private dashServe: DashpanelService,
    private resolver: ComponentFactoryResolver
  ) { }

  ngOnInit() {
    this.possiblePanels = this.dashServe.getAllPanelConfigs();

    this.choosePanel();
  }

  choosePanel() {
    if (this.selectedPanel == null || this.selectedPanel === undefined) {
      if (this.possiblePanels !== null) {
        this.selectedPanel = this.possiblePanels.find(
          one => one.dashPanelType === this.panelType
        );
      }
    }

    if (this.selectedPanel !== null && this.selectedPanel !== undefined) {
      const componentFactory = this.resolver.resolveComponentFactory(
        this.selectedPanel.component
      );

      const viewContainerRef = this.direct.viewContainerRef;
      viewContainerRef.clear();

      const componentRef = viewContainerRef.createComponent(componentFactory);

      (<IDashPanel>(
        componentRef.instance
      )).chosenSeverity = this.selectedPanel.dashPanelType;
    }
  }
}
