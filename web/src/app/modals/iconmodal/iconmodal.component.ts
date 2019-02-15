import { Component, OnInit, Inject } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'icon-modal',
  templateUrl: './iconmodal.component.html',
  styleUrls: ['./iconmodal.component.scss']
})
export class IconModalComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<IconModalComponent>, @Inject(MAT_DIALOG_DATA) public data: any, public dataService: DataService) { }

  ngOnInit() {
  }
}
