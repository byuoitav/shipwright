import { Directive, ViewContainerRef } from "@angular/core";

@Directive({
  selector: "[dashDirect]"
})
export class DashpanelDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
