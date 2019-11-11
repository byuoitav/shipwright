import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Room, Device } from 'src/app/objects/database';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'room-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.scss']
})
export class DevicesComponent implements OnInit, OnChanges {
  @Input() room: Room;

  deviceDataSource: MatTableDataSource<Device>;

  deviceColumns = ["warning", "name", "type", "address"];

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.room) {
      this.deviceDataSource = new MatTableDataSource(this.room.devices);
    }
  }

  missingPorts(d: Device): boolean {
    if (d.ports === undefined || d.ports.length === 0) {
      return false;
    }

    for (const p of d.ports) {
      if (p.sourceDevice === undefined || p.sourceDevice.length === 0) {
        return true;
      }
      if (p.destinationDevice === undefined || p.destinationDevice.length === 0) {
        return true;
      }
    }

    return false;
  }

}
