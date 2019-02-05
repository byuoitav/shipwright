import { Component, OnInit } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';

@Component({
  selector: 'state',
  templateUrl: './state.component.html',
  styleUrls: ['./state.component.scss']
})
export class StateComponent implements OnInit {

  constructor(public text: StringsService) { }

  ngOnInit() {
  }

}
