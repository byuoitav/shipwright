import { Injectable } from "@angular/core";
import { CanDeactivate } from "@angular/router";
import { Observable } from "rxjs";

export interface ComponentCanDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
}

@Injectable({
  providedIn: "root"
})
export class PendingChangesGuard implements CanDeactivate<ComponentCanDeactivate> {
  canDeactivate(component: ComponentCanDeactivate): boolean | Observable<boolean> {
    return component.canDeactivate() ?
      true :
      // NOTE: this warning message will only be shown when navigating elsewhere within your angular app;
      // when navigating away from your angular app, the browser will show a generic warning message
      confirm("WARNING: You have unsaved changes. Press Cancel to go back and save these changes, or OK to lose these changes.");
  }
}
