import { Injectable, EventEmitter } from "@angular/core";
import {
  $WebSocket,
  WebSocketConfig
} from "angular2-websocket/angular2-websocket";
import { JsonConvert } from "json2typescript";
import { RoomIssue } from '../objects/alerts';

export const OPEN = "open";
export const CLOSE = "close";
export const MESSAGE = "message";

@Injectable({
  providedIn: "root"
})
export class SocketService {
  private url: string;

  private socket: $WebSocket;
  public listener: EventEmitter<any>;
  private webSocketConfig: WebSocketConfig = {
    initialTimeout: 100,
    maxTimeout: 500,
    reconnectIfNotNormalClose: true
  };

  constructor() {
    this.url = "ws://" + location.hostname + ":9999/ws";
    this.socket = new $WebSocket(this.url, null, this.webSocketConfig);
    this.listener = new EventEmitter();

    const jsonConvert = new JsonConvert();
    jsonConvert.ignorePrimitiveChecks = false;

    this.socket.onMessage(msg => {
      const data = JSON.parse(msg.data);
      const a = jsonConvert.deserialize(data, RoomIssue);

      this.listener.emit(a);
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
