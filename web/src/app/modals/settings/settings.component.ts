import { Component, OnInit } from "@angular/core";
import { StringsService } from "src/app/services/strings.service";
import { MatDialogRef } from "@angular/material";
import { DataService } from "src/app/services/data.service";
import { CookieService } from "ngx-cookie-service";
import { APIService } from "src/app/services/api.service";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";

@Component({
  selector: "settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"]
})
export class SettingsModalComponent implements OnInit {
  panelMax: number[] = [];

  constructor(
    public text: StringsService,
    public data: DataService,
    public dialogRef: MatDialogRef<SettingsModalComponent>,
    public cookies: CookieService,
    public api: APIService
  ) {
    this.panelMax = Array.from(new Array(4), (val, index) => index + 1);
    console.log(data.notificationsEnabled);
  }

  ngOnInit() {}

  SetPanelCount(value: number) {
    this.cookies.set("panelCount", String(value));
    this.data.panelCount = value;
    this.data.settingsChanged.emit(value);
  }
  UpdateTheme(darkEnabled: boolean) {
    if (darkEnabled) {
      this.api.switchTheme("dark");
    } else {
      this.api.switchTheme("default");
    }
  }
  UpdateNotifications(notifications: boolean) {
    this.cookies.set("notifications", String(notifications));
    this.data.notificationsEnabled = notifications;
  }
}
