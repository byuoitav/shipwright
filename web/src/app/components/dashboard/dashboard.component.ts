import { Component, OnInit } from '@angular/core';
import { StringsService } from 'src/app/services/strings.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  panelCount = Array(4).fill(1);

  constructor(public text: StringsService, public modal: ModalService) { }

  ngOnInit() {
  }
}
