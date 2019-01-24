import { Component } from '@angular/core';
import { APIService } from '../../services/api.service';
import { StringsService } from 'src/app/services/strings.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  
  activeLink = ""

  currentUsername: string;

  constructor(public api: APIService, public text: StringsService) {
    this.activeLink = window.location.pathname.split("/", 2)[1];
    this.api.getCurrentUsername().then((res) => {
      this.currentUsername = res as string;
    });
  }
}
