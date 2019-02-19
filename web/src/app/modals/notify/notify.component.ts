import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DBResponse } from 'src/app/objects/database';

@Component({
  selector: 'app-notify',
  templateUrl: './notify.component.html',
  styleUrls: ['./notify.component.scss']
})
export class NotifyModalComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<NotifyModalComponent>, @Inject(MAT_DIALOG_DATA) public data: DBResponse) { }

  ngOnInit() {
  }
}
