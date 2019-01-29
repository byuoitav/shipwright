import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { RespondComponent } from '../modals/respond/respond.component';
import { AlertRow } from '../objects';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(private dialog: MatDialog) { }

  OpenRespondModal(row: AlertRow) {
    this.dialog.open(RespondComponent, {data: row});
  }
}
