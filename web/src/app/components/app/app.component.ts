import { Component, OnInit } from "@angular/core";
import { APIService } from "src/app/services/api.service";
import { CookieService } from "ngx-cookie-service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {
  currentUsername: string;

  constructor(public api: APIService, public cookies: CookieService) {
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
}
