import { Component, OnInit, ViewChild, ComponentFactoryResolver, forwardRef } from '@angular/core';

import { DashPanelDirective } from './dashpanel.directive';
import { DashPanelService } from 'src/app/services/dashpanel.service';
import { IDashPanel } from './idashpanel';
import { MonitoringService } from 'src/app/services/monitoring.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'dashpanel',
  templateUrl: './dashpanel.component.html',
  styleUrls: ['./dashpanel.component.scss']
})

export class DashPanelComponent implements OnInit {
  @ViewChild(forwardRef(()=>DashPanelDirective)) direct: DashPanelDirective;

  totalAlertsNum: number = 0;
  panelType: string = "all-alerts";

  constructor(private resolver: ComponentFactoryResolver, private dashServe: DashPanelService, public monitor: MonitoringService, private data: DataService) {
    
  }

  ngOnInit() {
    if(this.data.finished) {
      this.choosePanel();
      this.GetTotalAlertsDisplay();
    }
    else {
      this.data.loaded.subscribe(() => {
        this.choosePanel();
        this.GetTotalAlertsDisplay();
      })
    }
  }

  AllAlerts = "all-alerts";
  CritAlerts = "critical"
  WarnAlerts = "warning"
  Battery = "battery"

  choosePanel(pType?: string) {
    if(this.panelType == null) {
      return
    }

    if(pType != null) {
      this.panelType = pType;
    }

    let data = this.determineData();

    let panel = this.dashServe.getPanel(this.panelType, data)
    let componentFactory = this.resolver.resolveComponentFactory(panel.component);
    let viewContainerRef = this.direct.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    (<IDashPanel>componentRef.instance).data = data;

    if(this.panelType == this.AllAlerts) {
      this.panelType = ""
    }
    
    (<IDashPanel>componentRef.instance).chosenSeverity = this.panelType;
  }

  determineData(): any {
    if(this.panelType === this.AllAlerts) {
      return this.monitor.GetAllAlerts();
    }
    if(this.panelType === this.CritAlerts) {
      return this.monitor.GetAllAlerts(this.CritAlerts);
    }
    if(this.panelType === this.WarnAlerts) {
      return this.monitor.GetAllAlerts(this.WarnAlerts);
    }
    // TODO get data for battery report
  }

  GetTotalAlertsDisplay() {
    if(this.panelType != null && this.panelType != this.Battery) {
      let rows = this.monitor.GetAllAlerts(this.panelType)
      
      if(rows != null) {
        for(let r of rows) {
         this.totalAlertsNum += r.GetVisibleAlerts().length 
        }
      }
    }
  }
}
