import { Component, OnInit, EventEmitter } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { MatDialogRef } from '@angular/material';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsModalComponent implements OnInit {
  panelMax: number[] = [];

  constructor(public text: StringsService, public data: DataService, public dialogRef: MatDialogRef<SettingsModalComponent>) { 
    this.panelMax = Array.from(new Array(4), (val, index)=>index+1);
  }

  ngOnInit() {
  }

  SetPanelCount(value: number) {
    this.data.settingsChanged.emit(value);
  }
}
