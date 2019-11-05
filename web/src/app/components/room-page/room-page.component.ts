import { Component, OnInit } from "@angular/core";
import { APIService } from "src/app/services/api.service";
import { ActivatedRoute } from "@angular/router";
import { TextService } from "src/app/services/text.service";
import { Room } from "src/app/objects/database";

@Component({
  selector: "room-page",
  templateUrl: "./room-page.component.html",
  styleUrls: ["./room-page.component.scss"]
})
export class RoomPageComponent implements OnInit {
  selectedTab = 0;
  roomID: string;
  room: Room;

  constructor(
    private api: APIService,
    private route: ActivatedRoute,
    public text: TextService
  ) {
    this.route.params.subscribe(params => {
      this.roomID = params["roomID"];
      this.selectedTab = +params["tabNum"] - 1;

      this.api.GetRoom(this.roomID).then(answer => {
        this.room = answer as Room;
        console.log("room", this.room);
      });
    });
  }

  ngOnInit() {}

  tabChange(tabIndex: number) {
    const currentURL = window.location.pathname;
    const newURL = currentURL.substr(0, currentURL.length - 1) + (tabIndex + 1);
    window.history.replaceState(null, this.text.websiteTitle, newURL);
  }
}
