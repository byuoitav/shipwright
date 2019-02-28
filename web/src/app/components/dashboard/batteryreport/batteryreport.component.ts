import { Component, OnInit, Input } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { IDashPanel } from '../dashpanel/idashpanel';
import { DashPanelTypes } from 'src/app/services/dashpanel.service';

@Component({
  selector: 'battery-report',
  templateUrl: './batteryreport.component.html',
  styleUrls: ['./batteryreport.component.scss']
})
export class BatteryReportComponent implements OnInit, IDashPanel {
  @Input() info: any;
  @Input() chosenSeverity: DashPanelTypes;
  
  constructor(public text: StringsService) { }

  ngOnInit() {
  }

}
