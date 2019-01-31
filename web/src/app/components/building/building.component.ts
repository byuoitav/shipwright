import { Component, OnInit, Input } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { Building } from 'src/app/objects';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'building',
  templateUrl: './building.component.html',
  styleUrls: ['./building.component.scss']
})
export class BuildingComponent implements OnInit {
  @Input() building: Building;

  constructor(public text: StringsService, public modal: ModalService) { }

  ngOnInit() {
  }

}
