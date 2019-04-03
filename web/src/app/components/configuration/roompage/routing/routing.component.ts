import { Component, OnInit, Input } from "@angular/core";
import cytoscape from "cytoscape";

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
  cy: any;

  constructor(private api: APIService) {}

  async ngOnInit() {
    this.room = await this.api.GetRoom(this.roomID);
    console.log("routing room", this.room);

    // create the graph
    this.cy = cytoscape({
      container: document.getElementById("cy"),
      elements: this.graph(RoutingType.VIDEO),
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
            "target-arrow-shape": "triangle"
          }
        }
      ],
      layout: {
        name: "breadthfirst",
        directed: true,
        padding: 10
      }
    });
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
          elements.nodes.push({
            data: {
              id: v,
              name: v
            }
          });
        });
    }

    // create dest nodes/edges
    for (const [dest, sources] of map) {
      // create parent node for dest
      elements.nodes.push({
        data: {
          id: dest,
          name: dest
        }
      });

      const dev = this.room.devices.find(d => d.id === dest);
      if (!dev) {
        continue;
      }

      // create port nodes for dest
      for (const port of dev.ports) {
        elements.nodes.push({
          data: {
            id: dev.id + ":" + port.id,
            parent: dev.id,
            name: port.id
          }
        });
      }

      // create port edges going from source --> dest
      for (const source of sources) {
        const destport = dev.ports.find(p => p.sourceDevice === source);
        if (!destport) {
          continue;
        }

        // if the source devices has a port pointing to dest, then link it
        const srcdev = this.room.devices.find(d => d.id === source);
        if (!srcdev) {
          continue;
        }

        const srcport = srcdev.ports.find(p => p.destinationDevice === dev.id);
        if (srcport) {
          elements.edges.push({
            data: {
              id: source + ":" + dev.id,
              source: source + ":" + srcport.id,
              target: dev.id + ":" + destport.id
            }
          });
        } else {
          elements.edges.push({
            data: {
              id: source + ":" + dev.id,
              source: source,
              target: dev.id + ":" + destport.id
            }
          });
        }
      }
    }

    console.log("elements", elements);

    return elements;
  }
}
