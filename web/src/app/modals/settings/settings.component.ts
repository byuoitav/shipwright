import { Component, OnInit } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';

@Component({
  selector: 'settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsModalComponent implements OnInit {

  constructor(public text: StringsService) { }

  ngOnInit() {
  }

}
