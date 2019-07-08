import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CampusComponent } from "./components/campus/campus.component";
import { RoomListComponent } from "./components/room-list/room-list.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { RoomPageComponent } from "./components/room-page/room-page.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "dashboard",
    pathMatch: "full"
  },
  {
    path: "dashboard",
    component: DashboardComponent
  },
  {
    path: "campus",
    component: CampusComponent
  },
  {
    path: "campus/:buildingID/roomlist",
    component: RoomListComponent
  },
  {
    path: "campus/:roomID/tab/:tabNum",
    component: RoomPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
