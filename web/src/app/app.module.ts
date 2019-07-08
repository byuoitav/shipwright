import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";

import { CookieService } from "ngx-cookie-service";

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
  MatGridListModule,
  MatTooltipModule,
  MatBadgeModule
} from "@angular/material";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./components/app/app.component";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { APIService } from "./services/api.service";
import { SocketService } from "./services/socket.service";
import { OverlayContainer } from "@angular/cdk/overlay";
import { DndModule } from "ng2-dnd";
import { NotifierModule } from "angular-notifier";
import { CampusComponent } from "./components/campus/campus.component";
import { BuildingModalComponent } from "./modals/buildingmodal/buildingmodal.component";
import { TextService } from "./services/text.service";
import { ActivityButtonComponent } from "./components/activity-button/activity-button.component";
import { RoomListComponent } from "./components/room-list/room-list.component";
import { RoomModalComponent } from "./modals/roommodal/roommodal.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { DashpanelComponent } from "./components/dashpanel/dashpanel.component";
import { AlertTableComponent } from "./components/alert-table/alert-table.component";
import { DashpanelDirective } from "./components/dashpanel/dashpanel.directive";
import { RoomPageComponent } from "./components/room-page/room-page.component";
import { OverviewComponent } from "./components/room-page/overview/overview.component";
import { MonitoringComponent } from "./components/room-page/monitoring/monitoring.component";
import { BuilderComponent } from "./components/room-page/builder/builder.component";
import { RoutingComponent } from "./components/room-page/routing/routing.component";
import { PartsListComponent } from "./components/room-page/parts-list/parts-list.component";
import { SlideshowModule } from "ng-simple-slideshow";


@NgModule({
  declarations: [
    AppComponent,
    CampusComponent,
    BuildingModalComponent,
    ActivityButtonComponent,
    RoomListComponent,
    RoomModalComponent,
    DashboardComponent,
    DashpanelComponent,
    AlertTableComponent,
    DashpanelDirective,
    RoomPageComponent,
    OverviewComponent,
    MonitoringComponent,
    BuilderComponent,
    RoutingComponent,
    PartsListComponent
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
    MatTooltipModule,
    DndModule.forRoot(),
    NotifierModule.withConfig({
      theme: "material"
    }),
    MatGridListModule,
    MatBadgeModule,
    SlideshowModule
  ],
  entryComponents: [
    BuildingModalComponent,
    RoomModalComponent,
    AlertTableComponent
  ],
  providers: [
    APIService,
    SocketService,
    CookieService,
    TextService,
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
