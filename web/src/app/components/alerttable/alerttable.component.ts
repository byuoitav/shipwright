import { Component, OnInit, Input } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { IDashPanel } from '../dashpanel/dashpanel.component';

@Component({
  selector: 'alert-table',
  templateUrl: './alerttable.component.html',
  styleUrls: ['./alerttable.component.scss']
})
export class AlertTableComponent implements OnInit, IDashPanel {
  @Input() data: any;
  
  constructor(public text: StringsService) { }

  ngOnInit() {
  }

}
