import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[dashDirect]'
})
export class DashPanelDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}

