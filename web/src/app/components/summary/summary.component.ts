import { Component, OnInit } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { Alert, AlertRow, Device } from 'src/app/objects';
import { ActivatedRoute } from '@angular/router';
import { MonitoringService } from 'src/app/services/monitoring.service';
import { MatTableDataSource } from '@angular/material';
import { DataService } from 'src/app/services/data.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {
  roomAlertRow: AlertRow[];
  deviceList: Device[] = [];
  filteredDevices: Device[] = [];
  deviceSearch: string;

  constructor(public text: StringsService, private route: ActivatedRoute, public monitor: MonitoringService, public data: DataService, public modal: ModalService) {
    this.route.params.subscribe(params => {
      this.roomAlertRow = [this.monitor.alertRowMap.get(params["roomID"])]

      if(this.data.finished) {
        this.deviceList = this.data.roomToDevicesMap.get(this.roomAlertRow[0].roomID)
        this.filteredDevices = this.deviceList;
      } else {
        this.data.loaded.subscribe(() => {
          this.deviceList = this.data.roomToDevicesMap.get(this.roomAlertRow[0].roomID)
          this.filteredDevices = this.deviceList;
        })
      }
      
    })
  }

  ngOnInit() {
  }

  SearchDevices() {
    this.filteredDevices = [];

    if(this.deviceSearch == null || this.deviceSearch.length == 0) {
      this.filteredDevices = this.deviceList;
      return;
    }

    this.deviceList.forEach(device => {
      if(device.name.toLowerCase().includes(this.deviceSearch.toLowerCase()) && !this.filteredDevices.includes(device)) {
        this.filteredDevices.push(device);
      }

      if(device.displayName.toLowerCase().includes(this.deviceSearch.toLowerCase()) && !this.filteredDevices.includes(device)) {
        this.filteredDevices.push(device);
      }

      if(device.type.id.toLowerCase().includes(this.deviceSearch.toLowerCase()) && !this.filteredDevices.includes(device)) {
        this.filteredDevices.push(device);
      }

      device.roles.forEach(role => {
        if(role.id.toLowerCase().includes(this.deviceSearch.toLowerCase()) && !this.filteredDevices.includes(device)) {
          this.filteredDevices.push(device);
        }
      });

      if(device.tags != null) {
        device.tags.forEach(tag => {
          if(tag.toLowerCase().includes(this.deviceSearch.toLowerCase()) && !this.filteredDevices.includes(device)) {
            this.filteredDevices.push(device);
          }
        });
      }
    });
  }
}
