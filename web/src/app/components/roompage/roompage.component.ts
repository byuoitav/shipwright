import { Component, OnInit } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';

@Component({
  selector: 'room-page',
  templateUrl: './roompage.component.html',
  styleUrls: ['./roompage.component.scss']
})
export class RoomPageComponent implements OnInit {

  constructor(public text: StringsService) { }

  ngOnInit() {
  }

}
