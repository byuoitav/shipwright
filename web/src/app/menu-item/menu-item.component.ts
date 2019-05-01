import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { Group, AttributeSet } from "../objects/database";

@Component({
  selector: "app-menu-item",
  templateUrl: "./menu-item.component.html",
  styleUrls: ["./menu-item.component.scss"]
})
export class MenuItemComponent implements OnInit {
  @Input() subNodes: Group[];
  @Input() leafNodes: AttributeSet[];
  @Input() callback: (preset: AttributeSet) => void;

  @ViewChild("childMenu") public childMenu: any;

  constructor() { }

  ngOnInit() {
  }

  menuClicked(child: AttributeSet) {
    this.callback(child);
  }
}
