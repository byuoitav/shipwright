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

  constructor(private resolver: ComponentFactoryResolver, private dashServe: DashPanelService, private monitor: MonitoringService) {
    
  }

  ngOnInit() {
    this.choosePanel(this.AllAlerts);
  }

  AllAlerts = "all-alerts";
  CritAlerts = "critical"
  WarnAlerts = "warning"

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
    (<IDashPanel>componentRef.instance).data = data;
    (<IDashPanel>componentRef.instance).chosenSeverity = panelType;
  }

  determineData(panelType: string): any {
    if(panelType === this.AllAlerts) {
      return this.monitor.GetAllAlerts();
    }
    if(panelType === this.CritAlerts) {
      return this.monitor.GetAllAlerts(this.CritAlerts);
    }
    if(panelType === this.WarnAlerts) {
      return this.monitor.GetAllAlerts(this.WarnAlerts);
    }
    // TODO get data for battery report
  }
}
