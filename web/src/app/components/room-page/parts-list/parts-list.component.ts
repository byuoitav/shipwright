import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MatTableDataSource } from "@angular/material";

import { APIService } from "../../../services/api.service";
import { Room, Port, Device } from "../../../objects/database";

@Component({
  selector: "room-parts-list",
  templateUrl: "./parts-list.component.html",
  styleUrls: ["./parts-list.component.scss"]
})
export class PartsListComponent implements OnInit {
  room: Room;
  roomID: string;
  ips = {};

  portsDataSource: MatTableDataSource<Port>;
  devicesDataSource: MatTableDataSource<Device>;

  deviceCols = ["name", "type", "address", "ip"];
  portCols = ["destination", "name", "source"];

  constructor(private api: APIService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(async params => {
      if (params) {
        this.roomID = params["roomID"];
        this.room = await this.api.GetRoom(this.roomID);
        const ports = [];
        console.log("room", this.room);

        if (this.room && this.room.devices) {
          const notFound = "Not in QIP";

          for (const device of this.room.devices) {
            if (device.ports) {
              ports.push(...device.ports);
            }

            this.api.GetDeviceRawIPAddress(device.address).then(ip => {
              if (ip) {
                this.ips[device.address] = ip;
              } else {
                this.ips[device.address] = notFound;
              }
            });
          }
        }

        this.devicesDataSource = new MatTableDataSource(this.room.devices);
        this.portsDataSource = new MatTableDataSource(ports);
      }
    });
  }
}
