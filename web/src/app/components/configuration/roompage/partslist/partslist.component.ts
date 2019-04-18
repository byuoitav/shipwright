import { Component, OnInit, Input } from "@angular/core";
import { Device, Room, Port } from "src/app/objects/database";
import { DataService } from "src/app/services/data.service";
import { StringsService } from "src/app/services/strings.service";
import { ModalService } from "src/app/services/modal.service";
import { MatTableDataSource } from "@angular/material";
import { CombinedRoomState } from "src/app/objects/static";

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

  constructor(public data: DataService, public text: StringsService, public modal: ModalService) {
  }

  ngOnInit() {
  }

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
    console.log("Setting the data source for the first time");
    console.log(this.room.id);
    let test = this.data.roomToDevicesMap.get(this.room.id);
    console.log("---------", test);
    // this.roomList.sort((a, b) => a.roomID.localeCompare(b.roomID));

    // for (const room of this.roomList) {
    //   if (room.deviceStates) {
    //     room.deviceStates.sort((a, b) => {
    //       let aDT = a.deviceType ? a.deviceType : "";
    //       let bDT = b.deviceType ? b.deviceType : "";
    //       const aID = a.deviceID ? a.deviceID : "";
    //       const bID = b.deviceID ? b.deviceID : "";

    //       if (
    //         aDT.toLowerCase() === "dmps" ||
    //         aDT.toLowerCase() === "control-processor"
    //       ) {
    //         aDT = "aaa";
    //       }

    //       if (
    //         bDT.toLowerCase() === "dmps" ||
    //         bDT.toLowerCase() === "control-processor"
    //       ) {
    //         bDT = "aaa";
    //       }

    //       if (aDT === bDT) {
    //         return aID.localeCompare(bID);
    //       }

    //       return aDT.localeCompare(bDT);
    //     });
    //   }
    // }
    // this.filteredRoomList = this.roomList;
    test = this.deviceList;
    this.SetSourceAndDestinationDevices();
    console.log(test);
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
