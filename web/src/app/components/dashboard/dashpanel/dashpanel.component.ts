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
  panelType: string = AllAlerts;

  constructor(private resolver: ComponentFactoryResolver, private dashServe: DashPanelService, public data: DataService) {
    
  }

  ngOnInit() {
    if(this.data.finished) {
      console.log("derek 1")
      this.ChoosePanel(this.panelType);
    }
    else {
      this.data.loaded.subscribe(() => {
        console.log("derek 2")
        this.ChoosePanel(this.panelType);
      })
    }
  }

  ChoosePanel(pType?: string) {
    console.log(pType);
    // if(this.panelType == null) {
    //   return
    // }

    // if(pType != null) {
    //   this.panelType = pType;
    // }


    let panel = this.dashServe.getPanel(this.panelType)
    let componentFactory = this.resolver.resolveComponentFactory(panel.component);
    let viewContainerRef = this.direct.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);

    // let info = this.DetermineData();
    
    (<IDashPanel>componentRef.instance).chosenSeverity = this.panelType;
    // (<IDashPanel>componentRef.instance).info = info;
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

  TotalAlerts() {
    let count = 0;
    for(let issue of this.data.GetRoomIssues(this.panelType)) {
      count += issue.alertCount
    }
    return count
  }

  TotalActiveAlerts() {
    let count = 0;
    for(let issue of this.data.GetRoomIssues(this.panelType)) {
      count += issue.activeAlertCount
    }
    return count
  }
}
