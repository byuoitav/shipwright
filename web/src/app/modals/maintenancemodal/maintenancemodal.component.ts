import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { DataService } from "src/app/services/data.service";
import { StringsService } from "src/app/services/strings.service";
import { FormControl } from "@angular/forms";
import { StaticRoom } from "src/app/objects/static";
import { APIService } from 'src/app/services/api.service';

@Component({
  selector: "app-maintenancemodal",
  templateUrl: "./maintenancemodal.component.html",
  styleUrls: ["./maintenancemodal.component.scss"]
})
export class MaintenanceModalComponent {
  endTime: string;
  endDate = new FormControl(new Date());
  staticRoom: StaticRoom;

  constructor(
    public dialogRef: MatDialogRef<MaintenanceModalComponent>,
    public text: StringsService,
    public dataService: DataService,
    public api: APIService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.endTime = this.toDefaultMaintenanceEndTime(
      this.endDate.value.toTimeString()
    );

    if (this.dataService.finished) {
      this.staticRoom = this.dataService.GetRoomState(data).staticRoom;
    } else {
      this.dataService.loaded.subscribe(() => {
        this.staticRoom = this.dataService.GetRoomState(data).staticRoom;
      });
    }
  }

  submit(setMM: boolean) {
    if (setMM) {
      const timeParts = this.to24HourTime(this.endTime).split(":");

      this.endDate.value.setHours(+timeParts[0], +timeParts[1], +timeParts[2]);

      this.staticRoom.MaintenenceModeEndTime = this.endDate.value;
    }

    this.api.SetMaintenanceMode(this.staticRoom.roomID, this.staticRoom);

    // this.staticRoom.MaintenenceMode = setMM;
    
    // let issue = this.dataService.GetRoomIssue(this.staticRoom.roomID)
    // if (issue != null) {
    //   if (issue.issueTags.includes("maintenance") && !setMM) {
    //     issue.issueTags.splice(issue.issueTags.indexOf("maintenance"), 1);
    //   }
    //   else if (setMM && !issue.issueTags.includes("maintenance")) {
    //     issue.issueTags.push("maintenance");
    //   }
    // }
    // console.log(issue);

    this.dialogRef.close(this.staticRoom);
  }

  toDefaultMaintenanceEndTime(time: string) {
    const timeParts = time.split(":");

    if (timeParts.length < 2) {
      return time;
    }

    let hours = +timeParts[0] + 1;
    const mins = +timeParts[1];

    const over = hours - 23;
    if (over > 0) {
      hours = over;
    }

    return String(hours) + ":" + String(mins);
  }

  to24HourTime(time: string) {
    let hours = +time.split(":")[0];
    let mins = +time.split(":")[1].split(" ")[0];
    let period = time.split(":")[1].split(" ")[1];

    if (period == "PM") {
      hours += 12;
    }

    return String(hours) + ":" + String(mins) + ":00";
  }
}
