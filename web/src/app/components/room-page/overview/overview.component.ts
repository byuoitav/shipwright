import { Component, OnInit, Input } from "@angular/core";
import { Room } from "src/app/objects/database";
import { MatDialog } from '@angular/material';
import { RoomModalComponent } from 'src/app/modals/roommodal/roommodal.component';

@Component({
  selector: "room-overview",
  templateUrl: "./overview.component.html",
  styleUrls: ["./overview.component.scss"]
})
export class OverviewComponent implements OnInit {
  @Input() roomID: string;
  @Input() room: Room;
  imageURLArray = [
    "https://www.lifewithdogs.tv/wp-content/uploads/2016/10/selfie.jpg",
    "https://i.ytimg.com/vi/ZiK3l5AoO-w/hqdefault.jpg",
    "https://i.pinimg.com/236x/0a/ff/fc/0afffcb240e76c83096a7ea6fb88d175--dog-selfie-funny-selfie.jpg"
  ];

  constructor(
    private dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  editRoom() {
    this.dialog.open(RoomModalComponent, {data: this.room})
    .afterClosed()
    .subscribe((result) => {
      if (result != null && result === "deleted") {
        window.history.back();
      }
    });
  }
}
