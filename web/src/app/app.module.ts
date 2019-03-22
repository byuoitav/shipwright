import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";

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
  MatSelectModule,
  MatChipsModule,
  MatProgressSpinnerModule,
  MAT_DIALOG_DATA,
  MatSlideToggleModule,
  MatAutocompleteModule,
  MatGridListModule
} from "@angular/material";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./components/app/app.component";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { ConfigurationComponent } from "./components/configuration/configuration.component";
import { SettingsModalComponent } from "./modals/settings/settings.component";
import { ResolveModalComponent } from "./modals/resolve/resolve.component";
import { BuildingModalComponent } from "./modals/buildingmodal/buildingmodal.component";
import { RoomModalComponent } from "./modals/roommodal/roommodal.component";
import { DeviceModalComponent } from "./modals/devicemodal/devicemodal.component";
import { APIService } from "./services/api.service";
import { SocketService } from "./services/socket.service";
import { DataService } from "./services/data.service";
import { ModalService } from "./services/modal.service";
import { StringsService } from "./services/strings.service";
import { OverlayContainer } from "@angular/cdk/overlay";
import { DashPanelService } from "./services/dashpanel.service";
import { NotifyModalComponent } from "./modals/notify/notify.component";
import { DndModule } from "ng2-dnd";
import { PresetModalComponent } from "./modals/presetmodal/presetmodal.component";
import { IconModalComponent } from "./modals/iconmodal/iconmodal.component";
import { DashPanelComponent } from "./components/dashboard/dashpanel/dashpanel.component";
import { AlertTableComponent } from "./components/dashboard/alerttable/alerttable.component";
import { BatteryReportComponent } from "./components/dashboard/batteryreport/batteryreport.component";
import { BuildingListComponent } from "./components/configuration/buildinglist/buildinglist.component";
import { RoomListComponent } from "./components/configuration/roomlist/roomlist.component";
import { RoomPageComponent } from "./components/configuration/roompage/roompage.component";
import { DeviceListComponent } from "./components/configuration/devicelist/devicelist.component";
import { DashPanelDirective } from "./components/dashboard/dashpanel/dashpanel.directive";
import { CampusStateComponent } from "./components/state/campus/campus-state.component";
import { RoomStateComponent } from "./components/state/room/room-state.component";

import { NotifierModule } from "angular-notifier";
import { HelpModalComponent } from "./modals/helpmodal/helpmodal.component";
import { DeviceStateComponent } from "./components/state/device-state/device-state.component";
import { ResponseModalComponent } from "./modals/responsemodal/responsemodal.component";
import { MaintenanceModalComponent } from "./modals/maintenancemodal/maintenancemodal.component";
import { BuildingComponent } from './components/configuration/buildinglist/building/building.component';
import { RoomComponent } from './components/configuration/roomlist/room/room.component';
import { AlertsComponent } from './components/configuration/roompage/alerts/alerts.component';
import { BuilderComponent } from './components/configuration/roompage/builder/builder.component';
import { DeviceComponent } from './components/configuration/devicelist/device/device.component';
import { RoutingComponent } from './components/configuration/roompage/routing/routing.component';
import { InformationComponent } from './components/information/information.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ConfigurationComponent,
    DashPanelComponent,
    AlertTableComponent,
    BatteryReportComponent,
    BuildingListComponent,
    BuildingComponent,
    RoomListComponent,
    RoomComponent,
    RoomPageComponent,
    AlertsComponent,
    BuilderComponent,
    DeviceListComponent,
    DeviceComponent,
    SettingsModalComponent,
    ResolveModalComponent,
    BuildingModalComponent,
    RoomModalComponent,
    DeviceModalComponent,
    DashPanelDirective,
    NotifyModalComponent,
    PresetModalComponent,
    IconModalComponent,
    CampusStateComponent,
    RoomStateComponent,
    HelpModalComponent,
    DeviceStateComponent,
    ResponseModalComponent,
    MaintenanceModalComponent,
    RoutingComponent,
    InformationComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatSidenavModule,
    MatButtonModule,
    MatToolbarModule,
    MatCardModule,
    MatProgressSpinnerModule,
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
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonToggleModule,
    MatSelectModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    DndModule.forRoot(),
    NotifierModule.withConfig({
      theme: "material"
    }),
    MatGridListModule
  ],
  entryComponents: [
    SettingsModalComponent,
    ResolveModalComponent,
    BuildingModalComponent,
    RoomModalComponent,
    DeviceModalComponent,
    AlertTableComponent,
    BatteryReportComponent,
    NotifyModalComponent,
    PresetModalComponent,
    IconModalComponent,
    HelpModalComponent,
    ResponseModalComponent,
    MaintenanceModalComponent
  ],
  providers: [
    APIService,
    SocketService,
    DataService,
    ModalService,
    StringsService,
    DashPanelService,
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DIALOG_DATA, useValue: {} }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(public overlayContainer: OverlayContainer, api: APIService) {
    api.themeSwitched.subscribe(themes => {
      this.overlayContainer.getContainerElement().classList.remove(themes[0]);
      this.overlayContainer.getContainerElement().classList.add(themes[1]);
    });
  }
}
