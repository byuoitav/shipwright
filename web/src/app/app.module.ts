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
  MatTableModule,
  MatDialogModule,
  MatCheckboxModule,
  MatDatepickerModule,
  MatNativeDateModule,
  DateAdapter,
  NativeDateAdapter,
  MatPaginatorModule,
  MatSortModule,
  MatButtonToggleModule
} from "@angular/material";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { MonitoringComponent } from './components/monitoring/monitoring.component';
import { MonitoringService } from './services/monitoring.service';
import { APIService } from './services/api.service';
import { HttpClientModule } from '@angular/common/http';
import { StringsService } from './services/strings.service';
import { ConfigurationComponent } from './components/configuration/configuration.component';
import { ModalService } from './services/modal.service';
import { RespondComponent } from './modals/respond/respond.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    MonitoringComponent,
    ConfigurationComponent,
    RespondComponent
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
    MatDialogModule,
    MatCheckboxModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonToggleModule
  ],
  entryComponents: [
    RespondComponent
  ],
  providers: [
    MonitoringService,
    APIService,
    StringsService,
    ModalService,
    {provide: DateAdapter, useClass: NativeDateAdapter}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
