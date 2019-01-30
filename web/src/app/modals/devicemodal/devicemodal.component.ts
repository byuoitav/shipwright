import { Component, OnInit } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';

@Component({
  selector: 'device-modal',
  templateUrl: './devicemodal.component.html',
  styleUrls: ['./devicemodal.component.scss']
})
export class DeviceModalComponent implements OnInit {

  constructor(public text: StringsService) { }

  ngOnInit() {
  }

}
