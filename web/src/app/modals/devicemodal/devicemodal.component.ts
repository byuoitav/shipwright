import { Component, OnInit, Inject } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Device } from 'src/app/objects';
import { DataService} from 'src/app/services/data.service';

@Component({
  selector: 'device-modal',
  templateUrl: './devicemodal.component.html',
  styleUrls: ['./devicemodal.component.scss']
})
export class DeviceModalComponent implements OnInit {

  constructor(public text: StringsService, public dialogRef: MatDialogRef<DeviceModalComponent>, @Inject(MAT_DIALOG_DATA) public data: Device, public dataService: DataService) {

  }

  ngOnInit() {
  }

  Close() {
    this.dialogRef.close();
  }

  
  
}
