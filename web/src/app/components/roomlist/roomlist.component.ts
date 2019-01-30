import { Component, OnInit } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';

@Component({
  selector: 'room-list',
  templateUrl: './roomlist.component.html',
  styleUrls: ['./roomlist.component.scss']
})
export class RoomListComponent implements OnInit {

  constructor(public text: StringsService) { }

  ngOnInit() {
  }

}
