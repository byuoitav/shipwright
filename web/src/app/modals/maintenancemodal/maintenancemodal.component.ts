import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { DataService } from "src/app/services/data.service";
import { StringsService } from "src/app/services/strings.service";
import { Time } from "@angular/common";

@Component({
  selector: "app-maintenancemodal",
  templateUrl: "./maintenancemodal.component.html",
  styleUrls: ["./maintenancemodal.component.scss"]
})
export class MaintenanceModalComponent {
  constructor(
    public dialogRef: MatDialogRef<MaintenanceModalComponent>,
    public text: StringsService,
    public dataService: DataService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  submit(date, time: Time, roomID: string) {
    console.log(date);
    if (date != null && time != null) {
      const rs = this.dataService.GetRoomState(roomID);
      rs.staticRoom.MaintenenceMode === true;

      //do I need to combine the date and time into one variable and then set it below?

      // rs.staticRoom.MaintenenceModeEndTime === time;
    }

    const answer =
      "date:" + date.startAt + " time:" + time + " room: " + roomID;
    console.log("the button was pressed");
    this.dialogRef.close(answer);
  }
}
