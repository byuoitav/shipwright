import { Component, OnInit, ViewChild, ComponentFactoryResolver, forwardRef } from '@angular/core';

import { DashPanelDirective } from './dashpanel.directive';
import { DashPanelService } from 'src/app/services/dashpanel.service';
import { IDashPanel } from './idashpanel';
import { MonitoringService } from 'src/app/services/monitoring.service';

@Component({
  selector: 'dashpanel',
  templateUrl: './dashpanel.component.html',
  styleUrls: ['./dashpanel.component.scss']
})

export class DashPanelComponent implements OnInit {
  @ViewChild(forwardRef(()=>DashPanelDirective)) direct: DashPanelDirective;

  constructor(private resolver: ComponentFactoryResolver, private dashServe: DashPanelService, private monitor: MonitoringService) {}

  ngOnInit() {}

  AllAlerts = "all-alerts";
  CritAlerts = "critical-alerts"
  WarnAlerts = "warning-alerts"
  LowAlerts = "low-alerts"

  choosePanel(panelType: string) {
    if(panelType == null) {
      return
    }
    let data = this.determineData(panelType);

    let panel = this.dashServe.getPanel(panelType, data)
    let componentFactory = this.resolver.resolveComponentFactory(panel.component);
    let viewContainerRef = this.direct.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    console.log(data);
    (<IDashPanel>componentRef.instance).data = data;
  }

  determineData(panelType: string): any {
    if(panelType === this.AllAlerts) {
      return this.monitor.GetAllAlerts();
    }
    if(panelType === this.CritAlerts) {
      return this.monitor.GetCriticalAlerts();
    }
    if(panelType === this.WarnAlerts) {
      return this.monitor.GetWarningAlerts();
    }
    if(panelType === this.LowAlerts) {
      return this.monitor.GetLowAlerts();
    }
  }
}
