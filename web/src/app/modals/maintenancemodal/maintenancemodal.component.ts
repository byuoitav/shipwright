import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { DataService } from 'src/app/services/data.service';
import { StringsService } from 'src/app/services/strings.service';

@Component({
  selector: "app-maintenancemodal",
  templateUrl: "./maintenancemodal.component.html",
  styleUrls: ["./maintenancemodal.component.scss"]
})
export class MaintenanceModalComponent {

  constructor(public dialogRef: MatDialogRef<MaintenanceModalComponent>, public text: StringsService, public dataService: DataService, @Inject(MAT_DIALOG_DATA) public data: any) {}
}
