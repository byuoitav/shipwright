import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "activity-button",
  templateUrl: "./activity-button.component.html",
  styleUrls: ["./activity-button.component.scss"]
})
export class ActivityButtonComponent {
  _resolving: boolean;
  _resolved: boolean;
  _error: boolean;

  @Input() disabled: boolean;
  @Input() type: string;
  @Input() click: () => boolean;

  @Output() success: EventEmitter<void>;
  @Output() error: EventEmitter<void>;

  constructor() {
    this.reset();

    this.success = new EventEmitter();
    this.error = new EventEmitter();
  }

  reset() {
    this._resolving = false;
    this._resolved = false;
    this._error = false;
  }

  async _click() {
    if (this._resolving) {
      return;
    }

    this._resolving = true;

    const success = await this.click();
    if (success) {
      this._resolved = true;
      this._resolving = false;

      setTimeout(() => {
        this.reset();
        this.success.emit();
      }, 750);
    } else {
      this._error = true;

      setTimeout(() => {
        this.reset();
        this.error.emit();
      }, 2000);
    }
  }
}
