import { Component, OnInit } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';

@Component({
  selector: 'room-modal',
  templateUrl: './roommodal.component.html',
  styleUrls: ['./roommodal.component.scss']
})
export class RoomModalComponent implements OnInit {

  constructor(public text: StringsService) { }

  ngOnInit() {
  }

}
