import { Component, OnInit, ViewChild, ComponentFactoryResolver, forwardRef, Input } from '@angular/core';

import { DashPanelDirective } from './dashpanel.directive';
import { DashPanelService, DashPanelConfig, DashPanelTypes} from 'src/app/services/dashpanel.service';
import { IDashPanel } from './idashpanel';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'dashpanel',
  templateUrl: './dashpanel.component.html',
  styleUrls: ['./dashpanel.component.scss']
})

export class DashPanelComponent implements OnInit {
  @ViewChild(forwardRef(()=>DashPanelDirective)) direct: DashPanelDirective;  
  @Input() panelType: DashPanelTypes;
  possiblePanels : DashPanelConfig[];
  selectedPanel: DashPanelConfig;
  
  constructor(private resolver: ComponentFactoryResolver, private dashServe: DashPanelService, public data: DataService) {
    
  }

  ngOnInit() {
    this.possiblePanels = this.dashServe.getAllPanelConfigs();

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
    if (this.selectedPanel == null || this.selectedPanel == undefined) {
      if (this.possiblePanels != null) {
        this.selectedPanel = this.possiblePanels.find(one => one.dashPanelType == this.panelType);
      }
    }

    if (this.selectedPanel != null && this.selectedPanel != undefined) {
      let componentFactory = this.resolver.resolveComponentFactory(this.selectedPanel.component);    
      let viewContainerRef = this.direct.viewContainerRef;
      viewContainerRef.clear();

      let componentRef = viewContainerRef.createComponent(componentFactory);
      
      (<IDashPanel>componentRef.instance).chosenSeverity = this.selectedPanel.dashPanelType;    
    }
  }
}
