import { Component, OnInit, Inject } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Room } from 'src/app/objects';

@Component({
  selector: 'room-modal',
  templateUrl: './roommodal.component.html',
  styleUrls: ['./roommodal.component.scss']
})
export class RoomModalComponent implements OnInit {

  constructor(public text: StringsService, public dialogRef: MatDialogRef<RoomModalComponent>, @Inject(MAT_DIALOG_DATA) public data: Room) { }

  ngOnInit() {
  }

}
