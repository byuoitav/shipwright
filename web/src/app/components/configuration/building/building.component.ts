import { Component, OnInit, Input } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { ModalService } from 'src/app/services/modal.service';
import { DataService } from 'src/app/services/data.service';
import { Building } from 'src/app/objects/database';
import { BuildingStatus } from 'src/app/objects/static';

@Component({
  selector: 'building',
  templateUrl: './building.component.html',
  styleUrls: ['./building.component.scss']
})
export class BuildingComponent implements OnInit {
  @Input() building: Building;
  state: BuildingStatus;

  constructor(public text: StringsService, public modal: ModalService, private data: DataService) { }

  ngOnInit() {
    this.GetBuildingState()
  }

  GetImage(): string {
    return "../../../../assets" + this.building.id + ".jpg"
  }

  GetBuildingState() {
    this.data.GetBuildingState(this.building.id)
  }
}
