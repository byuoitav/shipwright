import { Component, OnInit, Inject } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { APIService} from 'src/app/services/api.service';
import { DataService} from 'src/app/services/data.service';
import { Room } from 'src/app/objects/database';

@Component({
  selector: 'room-modal',
  templateUrl: './roommodal.component.html',
  styleUrls: ['./roommodal.component.scss']
})
export class RoomModalComponent implements OnInit {

  constructor(public text: StringsService, public dialogRef: MatDialogRef<RoomModalComponent>, @Inject(MAT_DIALOG_DATA) public data: Room, private api: APIService, public dataService: DataService) { }

  ngOnInit() {
  }
  UpdateRoom() {
    this.api.UpdateRoom(this.data.id, this.data).then((resp) => {
      this.dialogRef.close(resp)
    }
    )
  }
  CloseModal() {
    this.dialogRef.close()
  }
}
