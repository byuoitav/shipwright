import { Component, OnInit, Input } from '@angular/core';
import { APIService } from 'src/app/services/api.service';
import { RoomIssue } from 'src/app/objects/alerts';

@Component({
  selector: 'app-alert-table',
  templateUrl: './alert-table.component.html',
  styleUrls: ['./alert-table.component.scss']
})
export class AlertTableComponent implements OnInit {
  @Input() singleRoom = false;
  totalIssueList: RoomIssue[];

  constructor(
    public api: APIService
  ) { }

  ngOnInit() {
    if (this.singleRoom) {
      
    }
    this.api.GetAllIssues().then((answer) => {
      this.totalIssueList = answer as RoomIssue[];
    });
  }


}
