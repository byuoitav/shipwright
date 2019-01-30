import { Component, OnInit } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';

@Component({
  selector: 'device-list',
  templateUrl: './devicelist.component.html',
  styleUrls: ['./devicelist.component.scss']
})
export class DeviceListComponent implements OnInit {

  constructor(public text: StringsService) { }

  ngOnInit() {
  }

}
