import { Component, OnInit, Inject } from "@angular/core";
import {
  FormControl,
  Validators,
  ValidatorFn,
  AbstractControl
} from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { RoomIssue, ResolutionInfo } from "src/app/objects/alerts";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

import { APIService } from "src/app/services/api.service";

export function inListValidator(list: any[]): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const valid = list.includes(control.value);
    return valid ? null : { invalid: { value: control.value } };
  };
}

@Component({
  selector: "resolve-modal",
  templateUrl: "./resolve.component.html",
  styleUrls: ["./resolve.component.scss"]
})
export class ResolveModalComponent implements OnInit {
  resolving = false;
  resolved = false;
  error = false;

  codeCtrl: FormControl;
  filteredCodes: Observable<string[]>;

  constructor(
    public dialogRef: MatDialogRef<ResolveModalComponent>,
    private api: APIService,
    @Inject(MAT_DIALOG_DATA)
    public data: { issue: RoomIssue; resInfo: ResolutionInfo; codes: string[] }
  ) {
    this.codeCtrl = new FormControl(this.data.resInfo.code, [
      Validators.required,
      inListValidator(this.data.codes)
    ]);

    this.codeCtrl.valueChanges.subscribe(val => {
      this.data.resInfo.code = val;
    });

    this.filteredCodes = this.codeCtrl.valueChanges.pipe(
      startWith(""),
      map(filter =>
        filter ? this.codeFilter(filter) : this.data.codes.slice()
      )
    );
  }

  ngOnInit() {}

  codeFilter = (filter: string): string[] => {
    const val = filter.toLowerCase();

    return this.data.codes.filter(code => {
      return code.toLowerCase().includes(val);
    });
  };

  onNoClick(): void {
    this.dialogRef.close();
  }

  resetButton() {
    this.resolving = false;
    this.resolved = false;
    this.error = false;
  }

  validForm() {
    return this.codeCtrl.valid;
  }

  async resolve() {
    if (this.resolving) {
      return;
    }

    this.resolving = true;
    this.data.resInfo.resolvedAt = new Date();

    try {
      const response = await this.api.ResolveIssue(
        this.data.issue.issueID,
        this.data.resInfo
      );

      if (response === "ok") {
        this.resolved = true;

        setTimeout(() => {
          this.resolving = false;
          this.dialogRef.close();
        }, 750);
      } else {
        this.error = true;
        setTimeout(() => {
          this.resetButton();
        }, 2000);
      }
    } catch (e) {
      this.error = true;
      setTimeout(() => {
        this.resetButton();
      }, 2000);
    }
  }
}
