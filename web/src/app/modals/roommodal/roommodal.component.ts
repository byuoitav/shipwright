import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { Room, DBResponse, RoomConfiguration } from "src/app/objects/database";
import { APIService } from "src/app/services/api.service";
import { TextService } from "src/app/services/text.service";

@Component({
  selector: "room-modal",
  templateUrl: "./roommodal.component.html",
  styleUrls: ["./roommodal.component.scss"]
})
export class RoomModalComponent implements OnInit {
  configurationList: RoomConfiguration[] = [];
  designationList: string[] = [];

  newAttrKey: string;
  newAttrValue: string;

  constructor(
    public dialogRef: MatDialogRef<RoomModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Room,
    private api: APIService,
    public text: TextService
  ) {
    this.api.GetRoomConfigurations().then((answer) => {
      this.configurationList = answer as RoomConfiguration[];
    });
    this.api.GetRoomDesignations().then((answer) => {
      this.designationList = answer as string[];
    });
  }

  ngOnInit() {
  }

  saveRoom = async (): Promise<boolean> => {
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
          console.error("failed to update room", resp);
        }
      } else {
        resp = await this.api.AddRoom(this.data);

        if (resp.success) {
          console.log("successfully added room", resp);
          this.data.isNew = false;
        } else {
          console.error("failed to add room", resp);
        }
      }

      return resp.success;
    } catch (e) {
      console.error("failed to save room:", e);
      return false;
    }
  }

  deleteRoom = async (): Promise<boolean> => {
    console.log("deleting room", this.data);
    try {
      if (!this.data.isNew) {
        let resp: DBResponse;
        resp = await this.api.DeleteRoom(
          this.data.id
        );
        if (resp.success) {
          console.log("successfully deleted room", resp);
        } else {
          console.error("failed to delete room", resp);
        }

        return resp.success;
      }
    } catch (e) {
      console.error("failed to save room:", e);
      return false;
    }
  }

  close(result: any) {
    this.dialogRef.close(result);
  }

  addAttribute() {
    if (this.text.addAttribute(this.newAttrKey, this.newAttrValue, this.data.attributes)) {
      this.newAttrKey = "";
      this.newAttrValue = "";
    }
  }
}
