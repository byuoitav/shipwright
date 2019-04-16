import { Component, OnInit, Input } from "@angular/core";
import { MatDialog } from "@angular/material";
import cytoscape from "cytoscape";

import { Room } from "src/app/objects/database";
import { APIService } from "src/app/services/api.service";
import { DeviceModalComponent } from "src/app/modals/devicemodal/devicemodal.component";

enum RoutingType {
  VIDEO
}

enum NodeType {
  SOURCE,
  SWITCH,
  OUTPUT
}

@Component({
  selector: "routing",
  templateUrl: "./routing.component.html",
  styleUrls: ["./routing.component.scss"]
})
export class RoutingComponent implements OnInit {
  @Input() roomID: string;
  room: Room;
  cy: any;

  constructor(private api: APIService, private dialog: MatDialog) {}

  async ngOnInit() {
    this.room = await this.api.GetRoom(this.roomID);
    console.log("routing room", this.room);

    // create the graph
    this.cy = cytoscape({
      container: document.getElementById("cy"),
      elements: this.graph(RoutingType.VIDEO),
      layout: {
        name: "breadthfirst",
        directed: true,
        padding: 20,
        circle: false,
        grid: true,
        avoidOverlap: true,
        animate: false,
        animationDuration: 0,
        nodeDimensionsIncludeLabels: true
      },
      selectionType: "single",
      style: [
        {
          selector: "node",
          css: {
            content: "data(name)",
            "text-valign": "center",
            "text-halign": "center"
          }
        },
        {
          selector: "node[type = 0]", // source
          css: {
            shape: "triangle"
          }
        },
        {
          selector: "node[type = 1]", // switch
          css: {
            shape: "rectangle",
            width: "label",
            height: "label",
            padding: function(ele) {
              return ele.incomers().length * 3;
            }
          }
        },
        {
          selector: "node[type = 2]", // output
          css: {
            shape: "octagon"
          }
        },
        {
          selector: ":parent",
          css: {
            "text-valign": "top",
            "text-halign": "center"
          }
        },
        {
          selector: "edge",
          css: {
            "curve-style": "bezier",
            "target-arrow-shape": "triangle-backcurve",
            "arrow-scale": 2,
            "target-endpoint": "outside-to-node-or-label",

            "source-distance-from-node": "1px",
            "source-label": "data(sourceport)",
            "source-text-offset": "50",
            "source-text-rotation": "autorotate",

            "target-distance-from-node": "3px",
            "target-label": "data(targetport)",
            "target-text-offset": "50",
            "target-text-rotation": "autorotate"
          }
        }
      ]
    });

    this.cy.on("tap", "node", event => {
      const node = event.target;
      this.openDeviceModal(node.id());
    });
  }

  openDeviceModal(id: string) {
    const device = this.room.devices.find(d => d.id === id);
    if (!device) {
      return;
    }

    const ref = this.dialog.open(DeviceModalComponent, {
      width: "50vw",
      data: device
    });

    ref.afterClosed().subscribe(async result => {
      if (result) {
        console.log("changes saved, updating routing graph");

        // reload the graph
        this.room = await this.api.GetRoom(this.roomID);

        this.cy.json({ elements: this.graph(RoutingType.VIDEO) });
        this.cy.fit();
      }
    });

    ref.componentInstance.setTab(2);
  }

  graph(routingType: RoutingType): any {
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

    const elements = {
      nodes: [],
      edges: []
    };

    // create source nodes (ones that are never a destination)
    for (const val of map.values()) {
      val
        .filter(v => !map.has(v))
        .forEach(v => {
          const dev = this.room.devices.find(d => d.id === v);
          if (dev) {
            elements.nodes.push({
              data: {
                id: v,
                name: v,
                type: NodeType.SOURCE
              },
              grabbable: false,
              selectable: true
            });
          }
        });
    }

    // create dest nodes/edges
    for (const [dest, sources] of map) {
      // create parent node for dest
      const dev = this.room.devices.find(d => d.id === dest);
      if (dev) {
        elements.nodes.push({
          data: {
            id: dest,
            name: dest,
            type: dev.roles.some(r => r.id.toLowerCase().includes("out"))
              ? NodeType.OUTPUT
              : NodeType.SWITCH
          },
          grabbable: false,
          selectable: true
        });

        // create port edges going from source --> dest
        for (const source of sources) {
          let destportid = "";
          const destport = dev.ports.find(p => p.sourceDevice === source);
          if (destport) {
            destportid = destport.friendlyName;
          }

          let srcportid = "";
          const srcdev = this.room.devices.find(d => d.id === source);
          if (srcdev) {
            const srcport = srcdev.ports.find(
              p => p.destinationDevice === dest
            );

            if (srcport) {
              srcportid = srcport.friendlyName;
            }
          }

          elements.edges.push({
            data: {
              id: source + ":" + dest,
              source: source,
              target: dest,
              targetport: destportid,
              sourceport: srcportid
            },
            selectable: true
          });
        }
      }
    }

    return elements;
  }
}
