import { Type } from '@angular/core';

export class CompItem {
  constructor(public component: Type<any>, public data: any) {}
}

export interface DashPanelComponent {
  data: any;
}
