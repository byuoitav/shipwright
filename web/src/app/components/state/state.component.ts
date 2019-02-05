import { Component, OnInit } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { StaticService } from 'src/app/services/static.service';

@Component({
  selector: 'state',
  templateUrl: './state.component.html',
  styleUrls: ['./state.component.scss']
})
export class StateComponent implements OnInit {

  constructor(public text: StringsService, public state: StaticService) { }

  ngOnInit() {
  }

}
