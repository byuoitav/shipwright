import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { ConfigurationComponent } from "./components/configuration/configuration.component";
import { RoomListComponent } from "./components/configuration/roomlist/roomlist.component";
import { RoomPageComponent } from "./components/configuration/roompage/roompage.component";
import { RoomStateComponent } from "./components/state/room/room-state.component";
import { DeviceStateComponent } from "./components/state/device-state/device-state.component";
import { InformationComponent } from "./components/information/information.component";
import { PendingChangesGuard } from "./pending-changes.guard";

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
    path: "configuration",
    component: ConfigurationComponent
  },
  {
    path: "campus",
    component: ConfigurationComponent
  },
  {
    path: "roomStatus",
    component: RoomStateComponent
  },
  {
    path: "deviceStatus",
    component: DeviceStateComponent
  },
  {
    path: "information",
    component: InformationComponent
  },
  {
    path: "configuration/:buildingID/roomlist",
    component: RoomListComponent
  },
  {
    path: "configuration/:roomID/roompage/:tab",
    component: RoomPageComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
