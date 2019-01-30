import { Component, OnInit } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';

@Component({
  selector: 'building-modal',
  templateUrl: './buildingmodal.component.html',
  styleUrls: ['./buildingmodal.component.scss']
})
export class BuildingModalComponent implements OnInit {

  constructor(public text: StringsService) { }

  ngOnInit() {
  }

}
