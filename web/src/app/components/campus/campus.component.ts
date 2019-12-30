import { Component, OnInit } from "@angular/core";
import { APIService } from "src/app/services/api.service";
import { Building } from "src/app/objects/database";
import { TextService } from "src/app/services/text.service";
import { MatDialog } from "@angular/material";
import { BuildingModalComponent } from "src/app/modals/buildingmodal/buildingmodal.component";
import { Router } from '@angular/router';

@Component({
  selector: "campus",
  templateUrl: "./campus.component.html",
  styleUrls: ["./campus.component.scss"]
})
export class CampusComponent implements OnInit {
  buildingList: Building[] = [];
  filteredBuildings: Building[] = [];
  filterQueries: string[] = [];

  constructor(
    public api: APIService,
    public text: TextService,
    public dialog: MatDialog,
    private router: Router) {
    this.api.GetAllBuildings().then((resp) => {
      this.buildingList = resp as Building[];
      this.filteredBuildings = this.buildingList;
    });
  }

  ngOnInit() {
  }

  filter() {
    this.filteredBuildings = [];

    if (this.filterQueries.length === 0) {
      this.filteredBuildings = this.buildingList;
      return;
    }

    for (const b of this.buildingList) {
      for (const q of this.filterQueries) {
        if (b.id.toLowerCase().includes(q.toLowerCase()) && !this.filteredBuildings.includes(b)) {
          this.filteredBuildings.push(b);
        }
        if (b.name.toLowerCase().includes(q.toLowerCase()) && !this.filteredBuildings.includes(b)) {
          this.filteredBuildings.push(b);
        }
        if (b.description.toLowerCase().includes(q.toLowerCase()) && !this.filteredBuildings.includes(b)) {
          this.filteredBuildings.push(b);
        }
        for (const tag of b.tags) {
          if (tag.toLowerCase().includes(q.toLowerCase()) && !this.filteredBuildings.includes(b)) {
            this.filteredBuildings.push(b);
          }
        }
      }
    }
  }

  getImage(buildingID: string): string {
    return "assets/images/" + buildingID + ".jpg";
  }

  editBuilding(building: Building) {
    this.dialog.open(BuildingModalComponent, { data: building })
    .afterClosed()
    .subscribe((result) => {
      if (result !== null && result === "deleted") {
        this.buildingList.splice(
          this.buildingList.indexOf(building),
          1
        );
        this.filter();
      }
    });
  }

  createBuilding() {
    const newBuilding = new Building();
    newBuilding.isNew = true;

    this.dialog.open(BuildingModalComponent, { data: newBuilding })
    .afterClosed()
    .subscribe((result) => {
      if (result !== null && result === true) {
        this.buildingList.push(newBuilding);
        this.buildingList.sort(this.text.sortAlphaNumByID);
        this.filter();
      }
    });
  }

  goToRoomList(buildingID: string) {
    this.router.navigate(["/campus/" + buildingID + "/roomlist"]);
  }
}
