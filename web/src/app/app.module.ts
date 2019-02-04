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
  MatButtonToggleModule,
  MatSelectModule
} from "@angular/material";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ConfigurationComponent } from './components/configuration/configuration.component';
import { StateComponent } from './components/state/state.component';
import { AlertTableComponent } from './components/alerttable/alerttable.component';
import { BatteryReportComponent } from './components/batteryreport/batteryreport.component';
import { BuildingListComponent } from './components/buildinglist/buildinglist.component';
import { BuildingComponent } from './components/building/building.component';
import { RoomListComponent } from './components/roomlist/roomlist.component';
import { RoomComponent } from './components/room/room.component';
import { RoomPageComponent } from './components/roompage/roompage.component';
import { SummaryComponent } from './components/summary/summary.component';
import { BuilderComponent } from './components/builder/builder.component';
import { DeviceListComponent } from './components/devicelist/devicelist.component';
import { DeviceComponent } from './components/device/device.component';
import { SettingsModalComponent } from './modals/settings/settings.component';
import { RespondModalComponent } from './modals/respond/respond.component';
import { BuildingModalComponent } from './modals/buildingmodal/buildingmodal.component';
import { RoomModalComponent } from './modals/roommodal/roommodal.component';
import { DeviceModalComponent } from './modals/devicemodal/devicemodal.component';
import { APIService } from './services/api.service';
import { SocketService } from './services/socket.service';
import { DataService } from './services/data.service';
import { StaticService } from './services/static.service';
import { MonitoringService } from './services/monitoring.service';
import { ModalService } from './services/modal.service';
import { StringsService } from './services/strings.service';
import { OverlayContainer } from '@angular/cdk/overlay';
import { DashPanelDirective } from './components/dashpanel/dashpanel.directive';
import { DashPanelComponent } from './components/dashpanel/dashpanel.component';
import { DashPanelService } from './services/dashpanel.service';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ConfigurationComponent,
    StateComponent,
    DashPanelComponent,
    AlertTableComponent,
    BatteryReportComponent,
    BuildingListComponent,
    BuildingComponent,
    RoomListComponent,
    RoomComponent,
    RoomPageComponent,
    SummaryComponent,
    BuilderComponent,
    DeviceListComponent,
    DeviceComponent,
    SettingsModalComponent,
    RespondModalComponent,
    BuildingModalComponent,
    RoomModalComponent,
    DeviceModalComponent,
    DashPanelDirective
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
    MatButtonToggleModule,
    MatSelectModule
  ],
  entryComponents: [
    SettingsModalComponent,
    RespondModalComponent,
    BuildingModalComponent,
    RoomModalComponent,
    DeviceModalComponent,
    AlertTableComponent,
    BatteryReportComponent
  ],
  providers: [
    APIService,
    SocketService,
    DataService,
    StaticService,
    MonitoringService,
    ModalService,
    StringsService,
    DashPanelService,
    {provide: DateAdapter, useClass: NativeDateAdapter}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(public overlayContainer: OverlayContainer, api: APIService) {
    api.themeSwitched.subscribe((themes) => {
      this.overlayContainer.getContainerElement().classList.remove(themes[0]);
      this.overlayContainer.getContainerElement().classList.add(themes[1]);
    })
  }
}
