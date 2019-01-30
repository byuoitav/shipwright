import { Component, OnInit } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';

@Component({
  selector: 'alert-table',
  templateUrl: './alerttable.component.html',
  styleUrls: ['./alerttable.component.scss']
})
export class AlertTableComponent implements OnInit {

  constructor(public text: StringsService) { }

  ngOnInit() {
  }

}
