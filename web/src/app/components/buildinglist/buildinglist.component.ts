import { Component, OnInit } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';

@Component({
  selector: 'building-list',
  templateUrl: './buildinglist.component.html',
  styleUrls: ['./buildinglist.component.scss']
})
export class BuildingListComponent implements OnInit {

  constructor(public text: StringsService) { }

  ngOnInit() {
  }

}
