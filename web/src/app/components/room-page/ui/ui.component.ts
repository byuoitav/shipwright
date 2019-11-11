import { Component, OnInit, Input } from '@angular/core';
import { Room } from 'src/app/objects/database';

@Component({
  selector: 'room-ui',
  templateUrl: './ui.component.html',
  styleUrls: ['./ui.component.scss']
})
export class UiComponent implements OnInit {
  @Input() room: Room;

  constructor() { }

  ngOnInit() {
  }

}
