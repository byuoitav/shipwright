import { Component, OnInit, Input, OnChanges } from "@angular/core";
import { Room, UIConfig, DeviceType, Device, ControlGroup } from "src/app/objects/database";
import { APIService } from "src/app/services/api.service";
import { MatTableDataSource, MatDialog } from "@angular/material";
import { ControlGroupModalComponent } from 'src/app/modals/control-group-modal/control-group-modal.component';

@Component({
  selector: "room-builder",
  templateUrl: "./builder.component.html",
  styleUrls: ["./builder.component.scss"]
})
export class BuilderComponent implements OnInit, OnChanges {
  @Input() room: Room;
  config: UIConfig;
  deviceTypes: DeviceType[];
  deviceTypeMap: Map<string, DeviceType>;

  deviceDataSource: MatTableDataSource<Device>;

  deviceColumns = ["warning", "name", "type", "address"];

  constructor(
    private api: APIService,
    private dialog: MatDialog
  ) {
    this.api.GetDeviceTypes().then((answer) => {
      this.deviceTypes = answer as DeviceType[];

      this.deviceTypeMap = new Map();

      for (const t of this.deviceTypes) {
        this.deviceTypeMap.set(t.id, t);
      }
    });
  }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.room && !this.config) {
      this.deviceDataSource = new MatTableDataSource(this.room.devices);
      this.api.GetUIConfig(this.room.id).then((answer) => {
        this.config = answer as UIConfig;
      });
    }
  }

  getDeviceIcon(deviceName: string): string {
    if (this.config) {
      let io = this.config.inputConfiguration.find((j) => {
        return j.name === deviceName;
      });

      if (!io) {
        io = this.config.outputConfiguration.find((j) => {
          return j.name === deviceName;
        });
      }

      if (io) {
        return io.icon;
      }
    }

    return "video_label";
  }

  missingPorts(d: Device): boolean {
    if (d.ports === undefined || d.ports.length === 0) {
      return false;
    }

    for (const p of d.ports) {
      if (p.sourceDevice === undefined || p.sourceDevice.length === 0) {
        return true;
      }
      if (p.destinationDevice === undefined || p.destinationDevice.length === 0) {
        return true;
      }
    }

    return false;
  }

  getPanelsForControlGroup(cg: ControlGroup): string {
    const panels = [];

    for (const p of this.config.panels) {
      if (p.controlGroup === cg.name) {
        panels.push(p.GetDeviceName());
      }
    }

    return panels.join(" ");
  }

  getUIPathIcon(cg: ControlGroup): string {
    for (const p of this.config.panels) {
      if (p.controlGroup === cg.name) {
        if (p.uiPath === "/cherry") {
          return "../../../../assets/images/cherry.png";
        } else if (p.uiPath === "/blueberry") {
          return "../../../../assets/images/blueberry.png";
        } else {
          return "";
        }
      }
    }
  }

  getOutputIcon(name: string) {
    const io = this.config.outputConfiguration.find((j) => {
      return j.name === name;
    });

    if (io) {
      return io.icon;
    }

    return "";
  }

  getInputIcon(name: string) {
    const io = this.config.inputConfiguration.find((j) => {
      return j.name === name;
    });

    if (io) {
      return io.icon;
    }

    return "";
  }

  addNewControlGroup() {
    const cg = new ControlGroup();
    cg.name = "Station " + (this.config.controlGroups.length + 1);
    this.config.controlGroups.push(cg);
  }

  openControlGroupModal(cg: ControlGroup) {
    this.dialog.open(ControlGroupModalComponent, {
      data: {
        cg: cg,
        room: this.room,
        uiConfig: this.config
      }
    });
  }
}
