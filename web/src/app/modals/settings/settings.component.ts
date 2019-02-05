import { Component, OnInit, EventEmitter } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { MonitoringService } from 'src/app/services/monitoring.service';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsModalComponent implements OnInit {
  panelMax: number[] = [];

  constructor(public text: StringsService, public monitor: MonitoringService, public dialogRef: MatDialogRef<SettingsModalComponent>) { 
    this.panelMax = Array.from(new Array(4), (val, index)=>index+1);
  }

  ngOnInit() {
  }

  SetPanelCount(value: number) {
    this.monitor.settingsChanged.emit(value);
  }
}
