import { Component, OnInit, Inject, ViewChild } from "@angular/core";
import {
  FormControl,
  Validators,
  ValidatorFn,
  AbstractControl
} from "@angular/forms";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatChipInputEvent,
  MatChipInput,
  MatAutocompleteSelectedEvent
} from "@angular/material";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

import { Person } from "src/app/objects/database";
import { APIService } from "src/app/services/api.service";

@Component({
  selector: "responsemodal",
  templateUrl: "./responsemodal.component.html",
  styleUrls: ["./responsemodal.component.scss"]
})
export class ResponseModalComponent implements OnInit {
  readonly separatorKeyCodes: number[] = []; // delimate filters with these keys

  respondersCtrl: FormControl;
  selectedResponders: Person[];
  filteredResponders: Observable<Person[]>;
  @ViewChild(MatChipInput) respondersInput: MatChipInput;

  sentTime: string;

  constructor(
    public dialogRef: MatDialogRef<ResponseModalComponent>,
    private api: APIService,
    @Inject(MAT_DIALOG_DATA)
    public data: { roomID: string; responders: Person[] }
  ) {
    // set sent time to now
    const now = new Date();
    this.sentTime = now.getHours() + ":" + now.getMinutes();
    this.selectedResponders = [];

    this.respondersCtrl = new FormControl(this.data.responders, [
      Validators.required
    ]);

    this.filteredResponders = this.respondersCtrl.valueChanges.pipe(
      startWith(""),
      map(filter =>
        filter ? this.respondersFilter(filter) : this.data.responders.slice()
      )
    );
  }

  ngOnInit() {}

  respondersFilter = (filter: string): Person[] => {
    const val = filter.toLowerCase();

    return this.data.responders.filter(person => {
      if (this.selectedResponders.includes(person)) {
        return false;
      }

      return (
        person.name.toLowerCase().includes(val) ||
        person.id.toLowerCase().includes(val)
      );
    });
  };

  onNoClick(): void {
    this.dialogRef.close();
  }

  addResponder(event: any) {
    let person: Person;

    if (event instanceof MatAutocompleteSelectedEvent) {
      person = this.data.responders.find(p => p.id === event.option.value);
    } else if (this.isMatChipInputEvent(event)) {
      const val = event.value.trim().toLowerCase();
      const possible = this.respondersFilter(val);

      if (possible && possible.length > 0) {
        person = possible[0];
      }
    }

    if (!person) {
      console.warn("selected an invalid person", event);
      return;
    }

    if (!this.selectedResponders.includes(person)) {
      this.selectedResponders.push(person);
    }

    // reset the input
    if (this.respondersInput) {
      // event.input = "";
    }
    if (this.isMatChipInputEvent(event) && event.input) {
      event.input.value = "";
    }

    // reset the autocomplete
    this.respondersCtrl.setValue("");
  }

  removeResponder(person: Person): void {
    const index = this.selectedResponders.indexOf(person);

    if (index >= 0) {
      this.selectedResponders.splice(index, 1);
    }
  }

  isMatChipInputEvent(obj: any): obj is MatChipInputEvent {
    return (
      obj.input instanceof HTMLInputElement && typeof obj.value === "string"
    );
  }
}
