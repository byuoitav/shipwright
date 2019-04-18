import { Injectable, EventEmitter } from "@angular/core";
import {
  $WebSocket,
  WebSocketConfig
} from "angular2-websocket/angular2-websocket";
import { JsonConvert } from "json2typescript";
import { RoomIssue } from "../objects/alerts";
import { StaticDevice } from "../objects/static";

export const OPEN = "open";
export const CLOSE = "close";
export const MESSAGE = "message";

@Injectable({
  providedIn: "root"
})
export class SocketService {
  private url: string;

  private socket: $WebSocket;
  public issues: EventEmitter<RoomIssue>;
  public devices: EventEmitter<StaticDevice>;
  private webSocketConfig: WebSocketConfig = {
    initialTimeout: 100,
    maxTimeout: 500,
    reconnectIfNotNormalClose: true
  };

  isRoomIssue(event: any): event is RoomIssue {
    return event["id"] !== undefined;
  }

  isStaticDevice(event: any): event is StaticDevice {
    return event["deviceID"] !== undefined;
  }

  constructor() {
    if (location.protocol === "https:") {
      console.log("using secure websocket");
      this.url = "wss://" + location.hostname + ":" + location.port + "/ws";
    } else {
      console.log("using unsecure websocket");
      this.url = "ws://" + location.hostname + ":" + location.port + "/ws";
    }

    this.socket = new $WebSocket(this.url, null, this.webSocketConfig);
    this.issues = new EventEmitter();
    this.devices = new EventEmitter();

    const jsonConvert = new JsonConvert();
    jsonConvert.ignorePrimitiveChecks = false;

    this.socket.onMessage(msg => {
      const data = JSON.parse(msg.data);
      // console.log("Websocket data:", data);
      if (this.isRoomIssue(data)) {
        const a = jsonConvert.deserializeObject(data, RoomIssue);
        this.issues.emit(a);
      } else if (this.isStaticDevice(data)) {
        const a = jsonConvert.deserializeObject(data, StaticDevice);
        this.devices.emit(a);
      } else {
        console.warn("unknown websocket message", msg);
      }
    });

    this.socket.onOpen(msg => {
      console.log("Websocket opened with", this.url, ":", msg);
    });

    this.socket.onError(msg => {
      console.log("websocket closed.", msg);
    });

    this.socket.onClose(msg => {
      console.log("trying again", msg);
    });
  }
}
