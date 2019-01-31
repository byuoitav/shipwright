import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ConfigurationComponent } from './components/configuration/configuration.component';
import { StateComponent } from './components/state/state.component';
import { RoomListComponent } from './components/roomlist/roomlist.component';
import { RoomPageComponent } from './components/roompage/roompage.component';

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
    component: StateComponent
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
