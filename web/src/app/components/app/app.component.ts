import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material";
import { APIService } from "src/app/services/api.service";
import { CookieService } from "ngx-cookie-service";

import { HelpModal } from "../../modals/helpmodal/help.modal";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {
  currentUsername: string;

  constructor(
    public api: APIService,
    public cookies: CookieService,
    private dialog: MatDialog
  ) {
    this.api.GetCurrentUsername().then(answer => {
      this.currentUsername = answer;
    });
  }

  ngOnInit() {}

  public wideSidenav(): boolean {
    const wide = this.cookies.get("wide-sidenav");

    if (wide === "true") {
      return true;
    } else {
      return false;
    }
  }

  public setWideSidenav(val: boolean) {
    this.cookies.set("wide-sidenav", String(val));
  }

  helpRequest = () => {
    this.dialog.open(HelpModal);
  };
}
