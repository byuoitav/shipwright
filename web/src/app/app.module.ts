import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from '@angular/core';

import {
  MatSidenavModule,
  MatButtonModule,
  MatToolbarModule,
  MatCardModule,
  MatDividerModule,
  MatListModule,
  MatExpansionModule,
  MatIconModule,
  MatProgressBarModule,
  MatMenuModule,
  MatTabsModule,
  MatFormFieldModule,
  MatInputModule,
  MatTableModule
} from "@angular/material";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { MonitoringComponent } from './components/monitoring/monitoring.component';
import { MonitoringService } from './services/monitoring.service';
import { APIService } from './services/api.service';
import { HttpClientModule } from '@angular/common/http';
import { StringsService } from './services/strings.service';
import { ConfigurationComponent } from './components/configuration/configuration.component';
import { CdkTableModule } from '@angular/cdk/table';

@NgModule({
  declarations: [
    AppComponent,
    MonitoringComponent,
    ConfigurationComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatSidenavModule,
    MatButtonModule,
    MatToolbarModule,
    MatCardModule,
    MatDividerModule,
    MatListModule,
    MatExpansionModule,
    MatIconModule,
    MatProgressBarModule,
    MatMenuModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    HttpClientModule,
    CdkTableModule
  ],
  providers: [
    MonitoringService,
    APIService,
    StringsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
