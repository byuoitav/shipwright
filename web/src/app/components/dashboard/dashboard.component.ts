import { Component, OnInit } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  panelCount;

  constructor(public text: StringsService, public data: DataService) {
    this.panelCount = Array(this.data.panelCount).fill(1);
    this.data.settingsChanged.subscribe((value) => {
      this.panelCount = Array(value).fill(1);
    })
  }

  ngOnInit() {
  }
}
