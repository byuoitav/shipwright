import { Component, OnInit, Input } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { IDashPanel } from '../dashpanel/idashpanel';

@Component({
  selector: 'battery-report',
  templateUrl: './batteryreport.component.html',
  styleUrls: ['./batteryreport.component.scss']
})
export class BatteryReportComponent implements OnInit, IDashPanel {
  @Input() info: any;
  @Input() chosenSeverity: string;
  
  constructor(public text: StringsService) { }

  ngOnInit() {
  }

}
