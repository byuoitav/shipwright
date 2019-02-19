import { Component, OnInit } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { APIService } from 'src/app/services/api.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  currentUsername: string;
  private urlParams: URLSearchParams;

  constructor(public text: StringsService, public api: APIService, public modal: ModalService) {
    
    this.api.GetCurrentUsername().then((resp) => {
      this.currentUsername = resp as string;
    })
  }

  ngOnInit() {
    this.urlParams = new URLSearchParams(window.location.search);
  }

  public wideSidenav(): boolean {
    if (typeof this.urlParams === "undefined" || this.urlParams === null) {
      return false;
    }

    if (this.urlParams.has("wide-sidenav")) {
      return this.urlParams.get("wide-sidenav").toLowerCase() === "true";
    }

    return true;
  }

  public setWideSidenav(val: boolean) {
    this.urlParams.set("wide-sidenav", val.toString());

    window.history.replaceState(
      null,
      "Shipwright",
      window.location.pathname + "?" + this.urlParams.toString()
    );
  }
}
