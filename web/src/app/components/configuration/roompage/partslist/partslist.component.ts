import { Component, OnInit, Input, AfterViewInit } from "@angular/core";
import { Device, Room, Port } from "src/app/objects/database";
import { DataService } from "src/app/services/data.service";
import { StringsService } from "src/app/services/strings.service";
import { ModalService } from "src/app/services/modal.service";
import { MatTableDataSource } from "@angular/material";
import { APIService } from "src/app/services/api.service";

export class PortTableItem {
  deviceName: string;
  port: Port;
}

@Component({
  selector: "partslist",
  templateUrl: "./partslist.component.html",
  styleUrls: ["./partslist.component.scss"]
})
export class PartsListComponent implements OnInit, AfterViewInit {
  @Input() deviceList: Device[] = [];
  @Input() room: Room;
  @Input() roomid: string;
  dataSource = new MatTableDataSource<Device>([]);
  portData = new MatTableDataSource<PortTableItem>([]);
  sourceDevices: string[] = [];
  columns = ["device", "type", "address", "ipaddress"];
  destinationDevices: string[] = [];
  ipaddressmap = {};
  portColumns = ["device-name", "port-name", "connection"];
  portDataList: PortTableItem[];

  constructor(
    public data: DataService,
    public text: StringsService,
    public modal: ModalService,
    private api: APIService
  ) {}

  ngOnInit() {}

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
    this.SetPortTableData();
    this.SetDataSource();
  }

  SetDataSource() {
    console.log("Setting the data source");

    this.dataSource.data = this.deviceList;
    this.portData.data = this.portDataList;
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

  SetPortTableData() {
    this.portDataList = [];
    for (const device of this.deviceList) {
      this.RemoveExcessPorts(device);
      if (device.ports != null && device.ports.length > 0) {
        for (const port of device.ports) {
          const p = new PortTableItem();
          p.deviceName = device.name;
          p.port = port;

          console.log(p);
          this.portDataList.push(p);
        }
      }
    }
  }

  RemoveExcessPorts(device: Device) {
    if (device.ports !== null && device.ports.length > 0) {
      const portsToKeep: Port[] = [];

      for (const port of device.ports) {
        if (
          port.sourceDevice !== null &&
          port.sourceDevice !== undefined &&
          port.destinationDevice !== null &&
          port.destinationDevice !== undefined
        ) {
          portsToKeep.push(port);
        }
      }

      console.log(portsToKeep);

      device.ports = portsToKeep;
      device.ports.sort(this.text.SortAlphaNumByID);
    }
  }

  printWithCss() {
    // Get the HTML of div
    const title = document.title;
    const divElements = document.getElementById("printme").innerHTML;
    const printWindow = window.open("", "_blank", "");
    // open the window
    printWindow.document.open();
    // write the html to the new window, link to css file
    printWindow.document.write(
      "<html><head><title>" +
        title +
        '</title> /*<link rel="stylesheet" type="text/css" href="/Css/site-print.css">*/</head><body>'
    );
    printWindow.document.write(divElements);
    printWindow.document.write("</body></html>");
    printWindow.focus();
    // printWindow.print();
    // printWindow.close();
  }
}
