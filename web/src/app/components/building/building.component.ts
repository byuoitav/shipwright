import { Component, OnInit, Input } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { Building } from 'src/app/objects';
import { ModalService } from 'src/app/services/modal.service';
import { DataService } from 'src/app/services/data.service';
import { MonitoringService } from 'src/app/services/monitoring.service';

@Component({
  selector: 'building',
  templateUrl: './building.component.html',
  styleUrls: ['./building.component.scss']
})
export class BuildingComponent implements OnInit {
  @Input() building: Building;
  goodRoomCount: number;
  badRoomCount: number;

  constructor(public text: StringsService, public modal: ModalService, private data: DataService, private monitor: MonitoringService) { }

  ngOnInit() {
    this.GetRoomCounts()
  }

  GetImage(): string {
    return "../../assets/images/" + this.building.id + ".jpg"
  }

  GetRoomCounts() {
    // TODO: get the number of rooms without alerts.
    this.goodRoomCount = 0;
    this.badRoomCount = 0;

    let list = this.data.buildingToRoomsMap.get(this.building.id);
    if(list == null) {
      return 0
    }

    this.goodRoomCount = list.length
    
    for(let room of list) {
      let a = this.monitor.roomAlertsMap.get(room.id)

      if(a != null && a.GetAlerts().length > 0) {
        this.goodRoomCount--;
        this.badRoomCount++;
      }
    }
  }

  NotADump(): boolean {
    return !this.building.tags.includes("dmps")
  }
}
