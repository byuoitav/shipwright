import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DataService } from 'src/app/services/data.service';
import { Room } from 'src/app/objects/database';
import { Alert } from 'src/app/objects/alerts';
import { APIService } from 'src/app/services/api.service';

@Component({
  selector: 'help-modal',
  templateUrl: './helpmodal.component.html',
  styleUrls: ['./helpmodal.component.scss']
})
export class HelpModalComponent implements OnInit {
  caller: string = "";
  roomID: string = "";
  notes: string = "";

  filteredRooms: Room[] = [];

  constructor(public dialogRef: MatDialogRef<HelpModalComponent>, @Inject(MAT_DIALOG_DATA) public data: any, public dataService: DataService, public api: APIService) {
    if(this.dataService.finished) {
      this.filterRooms();
    } else {
      this.dataService.loaded.subscribe(() => {
        this.filterRooms();
      })
    }
  }

  ngOnInit() {
    if(this.dataService.finished) {
      this.filterRooms();
    } else {
      this.dataService.loaded.subscribe(() => {
        this.filterRooms();
      })
    }
  }

  filterRooms() {
    this.filteredRooms = [];

    if(this.roomID == null || this.roomID.length == 0) {
      this.filteredRooms = this.dataService.allRooms;
      return
    }

    for(let room of this.dataService.allRooms) {
      if(room.id.toLowerCase().includes(this.roomID.toLowerCase())) {
        this.filteredRooms.push(room);
      }
    }
  }

  AddHelpRequest() {
    let alert = new Alert();

    alert.buildingID = this.roomID.substring(0, this.roomID.indexOf("-"));
    alert.roomID = this.roomID;
    alert.requester = this.caller;
    alert.message = this.notes;
    alert.active = true;
    alert.type = "Help Request"
    alert.category = "Help Request"
    alert.deviceID = this.roomID+"-HR1"
    alert.severity = "Critical"
    alert.manualResolve = true;

    this.api.AddAlert(alert);
    this.dialogRef.close();
  }
}
