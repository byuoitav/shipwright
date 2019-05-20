import { Component, OnInit, Inject } from "@angular/core";
import { StringsService } from "src/app/services/strings.service";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { APIService} from "src/app/services/api.service";
import { DataService} from "src/app/services/data.service";
import { Room, DBResponse } from "src/app/objects/database";

@Component({
  selector: "room-modal",
  templateUrl: "./roommodal.component.html",
  styleUrls: ["./roommodal.component.scss"]
})
export class RoomModalComponent implements OnInit {

  constructor(public text: StringsService,
    public dialogRef: MatDialogRef<RoomModalComponent>, @Inject(MAT_DIALOG_DATA) public data: Room,
    private api: APIService, public dataService: DataService) { }

  ngOnInit() {
  }

  // AddRoom() {
  //   if (this.data.id == null || this.data.name == null || this.data.configuration == null || this.data.designation == null) {
  //     return;
  //   }
  //   this.api.AddRoom(this.data).then((resp) => {
  //     this.dialogRef.close(resp);
  //   });
  // }

  // UpdateRoom() {
  //   this.api.UpdateRoom(this.data.id, this.data).then((resp) => {
  //     this.dialogRef.close(resp);
  //   });
  // }

  // CloseModal() {
  //   this.dialogRef.close();
  // }

  saveRoom = async (): Promise<boolean> => {
    this.data.name = this.data.id;
    console.log("saving room", this.data);
    try {
      let resp: DBResponse;
      if (!this.data.isNew) {
        resp = await this.api.UpdateRoom(
          this.data.id,
          this.data
        );
        if (resp.success) {
          console.log("successfully updated the room", resp);
        } else {
          console.error("failed to update the room", resp);
        }
      } else {
        resp = await this.api.AddRoom(this.data);

        if (resp.success) {
          console.log("successfully added the room", resp);
          this.data.isNew = false;
        } else {
          console.error("failed to add the room", resp);
        }
      }

      return resp.success;
    } catch (e) {
      console.error("failed to update the room:", e);
      return false;
    }
  };

  deleteRoom = async (): Promise<boolean> => {
    console.log("deleting room", this.data);
    try {
      if (!this.data.isNew) {
        let resp: DBResponse;
        resp = await this.api.DeleteDevice(
          this.data.id
        );
        if (resp.success) {
          console.log("successfully deleted the room", resp);
        } else {
          console.error("failed to delete the room", resp);
        }
        return resp.success;
      }
    } catch (e) {
      console.error("failed to delete the room:", e);
      return false;
    }
  };

  close(result: any) {
    this.dialogRef.close(result);
  }
}
