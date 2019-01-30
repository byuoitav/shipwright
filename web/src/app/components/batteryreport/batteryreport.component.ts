import { Component, OnInit } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';

@Component({
  selector: 'battery-report',
  templateUrl: './batteryreport.component.html',
  styleUrls: ['./batteryreport.component.scss']
})
export class BatteryReportComponent implements OnInit {

  constructor(public text: StringsService) { }

  ngOnInit() {
  }

}
