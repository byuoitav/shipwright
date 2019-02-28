import { Component, OnInit, ViewChild, ComponentFactoryResolver, forwardRef, Input } from '@angular/core';

import { DashPanelDirective } from './dashpanel.directive';
import { DashPanelService, DashPanelTypes } from 'src/app/services/dashpanel.service';
import { IDashPanel } from './idashpanel';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'dashpanel',
  templateUrl: './dashpanel.component.html',
  styleUrls: ['./dashpanel.component.scss']
})

export class DashPanelComponent implements OnInit {
  @ViewChild(forwardRef(()=>DashPanelDirective)) direct: DashPanelDirective;
  @Input()panelType: DashPanelTypes;
  title: string;

  constructor(private resolver: ComponentFactoryResolver, private dashServe: DashPanelService, public data: DataService) {
    
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

  ChoosePanel() {
    console.log("Panel Type", this.panelType)
    let panel = this.dashServe.getPanel(this.panelType)
    let componentFactory = this.resolver.resolveComponentFactory(panel.component);
    this.title = panel.title;
    let viewContainerRef = this.direct.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    
    (<IDashPanel>componentRef.instance).chosenSeverity = this.panelType;    
  }
}
