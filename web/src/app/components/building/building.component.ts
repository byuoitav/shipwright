import { Component, OnInit, Input } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { Building } from 'src/app/objects';
import { ModalService } from 'src/app/services/modal.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'building',
  templateUrl: './building.component.html',
  styleUrls: ['./building.component.scss']
})
export class BuildingComponent implements OnInit {
  @Input() building: Building;

  constructor(public text: StringsService, public modal: ModalService, private data: DataService) { }

  ngOnInit() {
  }

  GetImage(): string {
    return "../../assets/images/" + this.building.id + ".jpg"
  }

  GetGoodRoomsCount(): number {
    // TODO: get the number of rooms without alerts.
    let list = this.data.buildingToRoomsMap.get(this.building.id);

    if(list == null) {
      return 0
    }

    return list.length;    
  }

  GetBadRoomsCount(): number {
    // TODO: get the number of rooms with alerts.

    return 0
  }
}
