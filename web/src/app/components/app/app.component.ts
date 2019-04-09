import { Component, OnInit } from "@angular/core";
import { StringsService } from "src/app/services/strings.service";
import { APIService } from "src/app/services/api.service";
import { ModalService } from "src/app/services/modal.service";
import { DataService } from "src/app/services/data.service";
import { CookieService } from "ngx-cookie-service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {
  currentUsername: string;

  constructor(
    public text: StringsService,
    public api: APIService,
    public modal: ModalService,
    public data: DataService,
    public cookies: CookieService
  ) {
    this.api.GetCurrentUsername().then(resp => {
      this.currentUsername = resp as string;
    });
  }

  ngOnInit() {
    console.log(this.cookies.get("theme"));
    let name = this.cookies.get("theme");

    if (name == null || name.length === 0) {
      name = "default";
    }

    this.api.switchTheme(name);
  }

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
