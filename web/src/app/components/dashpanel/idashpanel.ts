import { Type } from '@angular/core';

export class DashPanel {
    constructor(public component: Type<any>, public data: any) {}
  }
  
  export interface IDashPanel {
    data: any;
  }