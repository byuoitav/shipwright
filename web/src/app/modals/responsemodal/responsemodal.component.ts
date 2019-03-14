import { Component, OnInit } from "@angular/core";
import { StringsService } from "src/app/services/strings.service";
import { DataService } from "src/app/services/data.service";
import { Person } from "src/app/objects/database";

@Component({
  selector: "app-responsemodal",
  templateUrl: "./responsemodal.component.html",
  styleUrls: ["./responsemodal.component.scss"]
})
export class ResponseModalComponent implements OnInit {
  responderSearch: string;
  filteredResponders: Person[];
  responders: Person[] = [];
  sentTime: string;
  arrivalTime: string;

  constructor(public text: StringsService, public data: DataService) {}

  ngOnInit() {}

  RemoveResponder(responder: Person) {
    const index = this.responders.indexOf(responder);
    if (index >= 0) {
      this.responders.splice(index, 1);
    }
    return;
  }

  AddResponder(value: string, event?: any) {
    if (this.responders == null || this.responders.length === 0) {
      this.responders = [];
    }

    // Add our responder
    for (const person of this.data.possibleResponders) {
      if (person.name === value.trim() || person.id === value.trim()) {
        if (!this.responders.includes(person)) {
          this.responders.push(person);
        }
        break;
      }
    }
    this.responderSearch = "";
    if (event != null) {
      if (event.input != null) {
        if (event.input.value != null) {
          if (event.input.value.length > 0) {
            event.input.value = "";
            console.log("Input success!");
          }
        }
      }
      if (event.option != null) {
        if (event.option.value != null) {
          if (event.option.value.length > 0) {
            event.option.value = "";
            console.log("Option success!");
          }
        }
      }
    }
  }

  FilterResponders() {
    this.filteredResponders = [];
    if (this.responderSearch == null || this.responderSearch.length === 0) {
      this.filteredResponders = this.data.possibleResponders;
      return;
    }
    for (const person of this.data.possibleResponders) {
      if (
        person.id.toLowerCase().includes(this.responderSearch.toLowerCase()) &&
        !this.filteredResponders.includes(person)
      ) {
        this.filteredResponders.push(person);
      }
      if (
        person.name
          .toLowerCase()
          .includes(this.responderSearch.toLowerCase()) &&
        !this.filteredResponders.includes(person)
      ) {
        this.filteredResponders.push(person);
      }
    }
  }
}
