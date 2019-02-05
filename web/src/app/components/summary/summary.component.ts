import { Component, OnInit } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';

@Component({
  selector: 'summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {

  constructor(public text: StringsService) { }

  ngOnInit() {
  }

}
