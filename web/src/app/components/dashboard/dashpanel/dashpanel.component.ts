import { Component, OnInit, ViewChild, ComponentFactoryResolver, forwardRef } from '@angular/core';

import { DashPanelDirective } from './dashpanel.directive';
import { DashPanelService } from 'src/app/services/dashpanel.service';
import { IDashPanel } from './idashpanel';
import { DataService } from 'src/app/services/data.service';
import { AllAlerts, CritAlerts, WarnAlerts } from 'src/app/objects/alerts';

@Component({
  selector: 'dashpanel',
  templateUrl: './dashpanel.component.html',
  styleUrls: ['./dashpanel.component.scss']
})

export class DashPanelComponent implements OnInit {
  @ViewChild(forwardRef(()=>DashPanelDirective)) direct: DashPanelDirective;

  totalAlertsNum: number = 0;
  panelType: string = "all-alerts";

  constructor(private resolver: ComponentFactoryResolver, private dashServe: DashPanelService, private data: DataService) {
    
  }

  ngOnInit() {
    if(this.data.finished) {
      this.ChoosePanel();
    }
    else {
      this.data.loaded.subscribe(() => {
        this.ChoosePanel();
      })
    }
  }

  ChoosePanel(pType?: string) {
    if(this.panelType == null) {
      return
    }

    if(pType != null) {
      this.panelType = pType;
    }


    let panel = this.dashServe.getPanel(this.panelType)
    let componentFactory = this.resolver.resolveComponentFactory(panel.component);
    let viewContainerRef = this.direct.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    
    (<IDashPanel>componentRef.instance).chosenSeverity = this.panelType;
  }

  // DetermineData(): any {
  //   console.log(this.panelType);
  //   if(this.panelType === AllAlerts) {
  //     return this.data.GetRoomIssues();
  //   }
  //   if(this.panelType === CritAlerts) {
  //     return this.data.GetRoomIssues(CritAlerts);
  //   }
  //   if(this.panelType === WarnAlerts) {
  //     return this.data.GetRoomIssues(WarnAlerts);
  //   }
  //   // TODO get data for battery report
  // }

  GetValue(value: string): string {
    if(value == "AllAlerts") {
      return AllAlerts
    }
    if(value == "CritAlerts") {
      return CritAlerts
    }
    if(value == "WarnAlerts") {
      return WarnAlerts
    }
  }
}
