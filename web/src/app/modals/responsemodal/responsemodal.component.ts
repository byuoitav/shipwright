import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  ElementRef
} from "@angular/core";
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

import { RoomIssue, RoomIssueResponse } from "src/app/objects/alerts";
import { Person } from "src/app/objects/database";
import { APIService } from "src/app/services/api.service";

@Component({
  selector: "responsemodal",
  templateUrl: "./responsemodal.component.html",
  styleUrls: ["./responsemodal.component.scss"]
})
export class ResponseModalComponent implements OnInit {
  readonly separatorKeyCodes: number[] = []; // delimate filters with these keys
  resolving = false;
  resolved = false;
  error = false;

  respondersCtrl: FormControl;
  filteredResponders: Observable<Person[]>;
  @ViewChild("respondersInput") respondersInput: ElementRef;

  response: RoomIssueResponse = new RoomIssueResponse();
  sentTime: string;

  constructor(
    public dialogRef: MatDialogRef<ResponseModalComponent>,
    private api: APIService,
    @Inject(MAT_DIALOG_DATA)
    public data: { issue: RoomIssue; responders: Person[] }
  ) {
    // set sent time to now
    const now = new Date();
    const pad = n => {
      return n < 10 ? "0" + n : n;
    };
    this.sentTime = pad(now.getHours()) + ":" + pad(now.getMinutes());

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
      if (this.response.responders.includes(person)) {
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

    if (!this.response.responders.includes(person)) {
      this.response.responders.push(person);
    }

    // reset the input
    if (this.respondersInput && this.respondersInput.nativeElement) {
      this.respondersInput.nativeElement.value = "";
    }
    if (this.isMatChipInputEvent(event) && event.input) {
      event.input.value = "";
    }

    // reset the autocomplete
    this.respondersCtrl.setValue("");
  }

  removeResponder(person: Person): void {
    const index = this.response.responders.indexOf(person);

    if (index >= 0) {
      this.response.responders.splice(index, 1);
    }
  }

  isMatChipInputEvent(obj: any): obj is MatChipInputEvent {
    return (
      obj.input instanceof HTMLInputElement && typeof obj.value === "string"
    );
  }

  validForm(): boolean {
    return true;
  }

  resetButton() {
    this.resolving = false;
    this.resolved = false;
    this.error = false;
  }

  async resolve() {
    if (this.resolving) {
      return;
    }

    this.resolving = true;

    // set the date
    const split = this.sentTime.split(":");
    this.response.helpSentAt = new Date();
    this.response.helpSentAt.setHours(parseInt(split[0], 10));
    this.response.helpSentAt.setMinutes(parseInt(split[1], 10));

    this.data.issue.roomIssueResponses.push(this.response);

    try {
      const response = await this.api.UpdateIssue(this.data.issue);
      console.log("response", response);
      if (response === "ok") {
        console.log("here");
        this.resolved = true;

        setTimeout(() => {
          this.resolving = false;
          this.dialogRef.close();
        }, 750);
      } else {
        console.log("here2");
        this.error = true;
        this.data.issue.roomIssueResponses.pop();

        setTimeout(() => {
          this.resetButton();
        }, 2000);
      }
    } catch (e) {
      this.error = true;
      this.data.issue.roomIssueResponses.pop();
      console.error("error updating issue", e);

      setTimeout(() => {
        this.resetButton();
      }, 2000);
    }
  }
}
