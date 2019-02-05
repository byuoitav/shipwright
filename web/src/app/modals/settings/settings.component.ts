import { Component, OnInit } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { MonitoringService } from 'src/app/services/monitoring.service';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsModalComponent implements OnInit {

  constructor(public text: StringsService, private monitor: MonitoringService, public dialogRef: MatDialogRef<SettingsModalComponent>) { }

  ngOnInit() {
  }

  SetPanelCount(value: number) {
    this.monitor.panelCount = value;
  }
}
