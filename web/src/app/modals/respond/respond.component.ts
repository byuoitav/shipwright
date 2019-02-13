import { Component, OnInit } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';

@Component({
  selector: 'respond-modal',
  templateUrl: './respond.component.html',
  styleUrls: ['./respond.component.scss']
})
export class RespondModalComponent implements OnInit {

  constructor(public text: StringsService) {
  }

  ngOnInit() {
  }
}
