import { Component, OnInit, Input } from "@angular/core";

import { Room } from "src/app/objects/database";
import { APIService } from "src/app/services/api.service";

enum RoutingType {
  VIDEO
}

@Component({
  selector: "routing",
  templateUrl: "./routing.component.html",
  styleUrls: ["./routing.component.scss"]
})
export class RoutingComponent implements OnInit {
  @Input() roomID: string;
  room: Room;

  constructor(private api: APIService) {}

  async ngOnInit() {
    this.room = await this.api.GetRoom(this.roomID);
    console.log("routing room", this.room);

    console.log("sources", this.sources(RoutingType.VIDEO));
  }

  sources(routingType: RoutingType): string[] {
    let map: Map<string, string[]>;
    switch (routingType) {
      case RoutingType.VIDEO:
        map = this.room.signalPaths.video;
        break;
      default:
        map = undefined;
    }

    if (!map) {
      return undefined;
    }

    const sources = [];
    for (const val of map.values()) {
      val
        .filter(v => !map.has(v))
        .forEach(v => {
          sources.push(v);
        });
    }

    return sources;
  }

  outputs(routingType: string): string[] {
    return [];
  }
}
