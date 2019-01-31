import { Component, OnInit, Input } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { Room } from 'src/app/objects';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {
  @Input() room: Room;

  constructor(public text: StringsService, public modal: ModalService) { }

  ngOnInit() {
  }

}
