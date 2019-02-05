import { Component, OnInit, Inject } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Building } from 'src/app/objects';
import { APIService } from 'src/app/services/api.service';

@Component({
  selector: 'building-modal',
  templateUrl: './buildingmodal.component.html',
  styleUrls: ['./buildingmodal.component.scss']
})
export class BuildingModalComponent implements OnInit {

  constructor(public text: StringsService, public dialogRef: MatDialogRef<BuildingModalComponent>, @Inject(MAT_DIALOG_DATA) public data: Building, private api: APIService) { }

  ngOnInit() {
  }

  UpdateBuilding() {
    this.api.UpdateBuilding(this.data.id, this.data);
  }
}
