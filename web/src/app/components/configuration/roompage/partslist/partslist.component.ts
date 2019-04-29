import { Component, OnInit, Input } from "@angular/core";
import { Device, Room, Port } from "src/app/objects/database";
import { DataService } from "src/app/services/data.service";
import { StringsService } from "src/app/services/strings.service";
import { ModalService } from "src/app/services/modal.service";
import { MatTableDataSource } from "@angular/material";
import { CombinedRoomState } from "src/app/objects/static";
import { APIService } from "src/app/services/api.service";

@Component({
  selector: "partslist",
  templateUrl: "./partslist.component.html",
  styleUrls: ["./partslist.component.scss"]
})
export class PartsListComponent implements OnInit {
  @Input() deviceList: Device[] = [];
  @Input() room: Room;
  @Input() roomid: string;
  dataSource = new MatTableDataSource<Device>([]);
  sourceDevices: string[] = [];
  columns = ["device", "type", "address", "ipaddress"];
  destinationDevices: string[] = [];
  ipaddressmap = {};

  constructor(public data: DataService, public text: StringsService, public modal: ModalService, private api: APIService) {
  }

  ngOnInit() {
  }

  // tslint:disable-next-line: use-life-cycle-interface
  ngAfterViewInit() {
    if (this.data.finished) {
      this.SetDataSourceFirstTime();
    } else {
      this.data.loaded.subscribe(() => {
        this.SetDataSourceFirstTime();
      });
    }
  }

  SetDataSourceFirstTime() {
    console.log("ROOM: ", this.room);
    let devices = this.data.roomToDevicesMap.get(this.room.id);
    for (const ds of devices) {
      console.log(ds.address);
      let rawIP = "Not in QIP";
      this.api.GetDeviceRawIPAddress(ds.address).then(addr => {
        console.log("response:", addr);
        if (addr != null) {
          rawIP = addr;
        }
        this.ipaddressmap[ds.address] = rawIP;
      });
    }
    devices = this.deviceList;
    this.SetSourceAndDestinationDevices();
    this.SetDataSource();
  }

  SetDataSource() {
    console.log("Setting the data source");

    this.dataSource.data = this.deviceList;
    // refresh data each time a static device updates
    setTimeout(() => {
      // this.dataSource.paginator = this.paginator;
      // this.dataSource.sort = this.sort;
    });
  }
  IsAnInPort(port: Port): boolean {
    return port.tags.includes("in");
  }
  SetSourceAndDestinationDevices() {
    for (const dev of this.deviceList) {
      const type = this.data.deviceTypeMap.get(dev.type.id);
      if (type.source) {
        this.sourceDevices.push(dev.id);
      }
      if (type.destination) {
        this.destinationDevices.push(dev.id);
      }
    }
  }

}
