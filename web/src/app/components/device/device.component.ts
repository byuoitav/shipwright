import { Component, OnInit, Input } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { Device } from 'src/app/objects';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.scss']
})
export class DeviceComponent implements OnInit {
  @Input() device: Device;

  constructor(public text: StringsService, public modal: ModalService) { }

  ngOnInit() {
  }

  GetDeviceIcon() {
    return this.text.DefaultIcons[this.device.type.id];
  }
}
