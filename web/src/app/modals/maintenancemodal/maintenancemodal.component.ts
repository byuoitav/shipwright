import { Component, Inject } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

/**
 * @title Dialog Overview
 */

export interface DialogData {
  animal: string;
  name: string;
}
@Component({
  selector: "app-maintenancemodal",
  templateUrl: "./maintenancemodal.component.html",
  styleUrls: ["./maintenancemodal.component.scss"]
})
export class MaintenanceModalComponent {
  animal: string;
  name: string;

  constructor(public dialog: MatDialog) {}

  openDialog(): void {
    const dialogRef = this.dialog.open(MaintenanceModalComponentDialog, {
      width: "250px",
      data: { name: this.name, animal: this.animal }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("The dialog was closed");
      this.animal = result;
    });
  }
}

@Component({
  selector: "app-maintenancemodal",
  templateUrl: "./maintenancemodal.component.html"
})
export class MaintenanceModalComponentDialog {
  constructor(
    public dialogRef: MatDialogRef<MaintenanceModalComponentDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
