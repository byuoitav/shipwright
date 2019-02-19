import { Type } from '@angular/core';

export class DashPanel {
    constructor(public component: Type<any>) {}
  }
  
  export interface IDashPanel {
    chosenSeverity: string;
  }