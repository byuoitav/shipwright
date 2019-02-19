import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ConfigurationComponent } from './components/configuration/configuration.component';
import { CampusStateComponent } from './components/state/campus/campus-state.component';
import { RoomListComponent } from './components/configuration/roomlist/roomlist.component';
import { RoomPageComponent } from './components/configuration/roompage/roompage.component';

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
    path: "state",
    component: CampusStateComponent
  },
  {
    path: "configuration/:buildingID/roomlist",
    component: RoomListComponent
  },
  {
    path: "configuration/:roomID/roompage",
    component: RoomPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
