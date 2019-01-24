import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MonitoringComponent } from './components/monitoring/monitoring.component';
import { ConfigurationComponent } from './components/configuration/configuration.component';

const routes: Routes = [
  {
    path: "",
    redirectTo: "monitoring",
    pathMatch: "full"
  },
  {
    path: 'monitoring',
    component: MonitoringComponent
  },
  {
    path: 'configuration',
    component: ConfigurationComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
