import { Component, OnInit } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { Alert, Device, RoomAlerts } from 'src/app/objects';
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
  roomAlerts: RoomAlerts[];
  deviceList: Device[] = [];
  filteredDevices: Device[] = [];
  deviceSearch: string;
  roomID: string;

  constructor(public text: StringsService, private route: ActivatedRoute, public monitor: MonitoringService, public data: DataService, public modal: ModalService) {
    this.route.params.subscribe(params => {
      this.roomID = params["roomID"]
      

      if(this.data.finished) {
        this.roomAlerts = [this.monitor.roomAlertsMap.get(this.roomID)]
        this.deviceList = this.data.roomToDevicesMap.get(this.roomID)
        this.filteredDevices = this.deviceList;
      } else {
        this.data.loaded.subscribe(() => {
          this.roomAlerts = [this.monitor.roomAlertsMap.get(this.roomID)]
          this.deviceList = this.data.roomToDevicesMap.get(this.roomID)
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

  GoBack() {
    window.history.back();
  }

  GetRoomAlerts() {
    if(this.roomAlerts == null) {
      return null
    }

    return this.roomAlerts[0]
  }
}
