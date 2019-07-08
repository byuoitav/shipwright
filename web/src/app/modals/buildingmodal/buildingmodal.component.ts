import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { Building, DBResponse } from "src/app/objects/database";
import { APIService } from "src/app/services/api.service";
import { TextService } from "src/app/services/text.service";

@Component({
  selector: "building-modal",
  templateUrl: "./buildingmodal.component.html",
  styleUrls: ["./buildingmodal.component.scss"]
})
export class BuildingModalComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<BuildingModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Building,
    private api: APIService,
    public text: TextService
  ) { }

  ngOnInit() {
  }

  saveBuilding = async (): Promise<boolean> => {
    console.log("saving building", this.data);
    try {
      let resp: DBResponse;
      if (!this.data.isNew) {
        resp = await this.api.UpdateBuilding(
          this.data.id,
          this.data
        );
        if (resp.success) {
          console.log("successfully updated building", resp);
        } else {
          console.error("failed to update building", resp);
        }
      } else {
        resp = await this.api.AddBuilding(this.data);

        if (resp.success) {
          console.log("successfully added building", resp);
          this.data.isNew = false;
        } else {
          console.error("failed to add building", resp);
        }
      }

      return resp.success;
    } catch (e) {
      console.error("failed to save building:", e);
      return false;
    }
  }

  deleteBuilding = async (): Promise<boolean> => {
    console.log("deleting building", this.data);
    try {
      if (!this.data.isNew) {
        let resp: DBResponse;
        resp = await this.api.DeleteBuilding(
          this.data.id
        );
        if (resp.success) {
          console.log("successfully deleted building", resp);
        } else {
          console.error("failed to delete building", resp);
        }

        return resp.success;
      }
    } catch (e) {
      console.error("failed to save building:", e);
      return false;
    }
  }

  close(result: any) {
    this.dialogRef.close(result);
  }
}
