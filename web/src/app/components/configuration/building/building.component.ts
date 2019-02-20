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
  @Input() building: Building = new Building();
  state: BuildingStatus;
  goodCount : int = 0;

  constructor(public text: StringsService, public modal: ModalService, private data: DataService) {
    this.state = new BuildingStatus();
  }

  ngOnInit() {
    if(this.data.finished) {
      console.log(this.data.finished);
      this.GetBuildingState()
      } else {
        this.data.loaded.subscribe(() => {
        this.GetBuildingState()
      })
    }
  }

  GetImage(): string {
    return "assets/images/" + this.building.id + ".jpg"
  }

  GetBuildingState() {
    this.state = this.data.GetBuildingState(this.building.id);
  }
}
