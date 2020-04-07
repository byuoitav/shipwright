import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { RoomIssue, ResolutionInfo } from 'src/app/objects/alerts';
import { APIService } from 'src/app/services/api.service';

@Component({
  selector: 'app-resolvemodal',
  templateUrl: './resolvemodal.component.html',
  styleUrls: ['./resolvemodal.component.scss']
})
export class ResolveModalComponent implements OnInit {
  resolutionService: string;
  resolutionCode: string;
  resolutionNotes: string;

  possibleCodes: string[] = [];

  constructor(
    public ref: MatDialogRef<ResolveModalComponent>, 
    @Inject(MAT_DIALOG_DATA) public issue: RoomIssue,
    public api: APIService) {
      this.api.GetClosureCodes().then((codes) => {
        console.log(codes);
        this.possibleCodes = codes;
      })
    }

  ngOnInit() {
  }

  cancel = () => {
    this.ref.close();
  }

  resolve = () => {
    const info = new ResolutionInfo();
    info.service = this.resolutionService;
    info.code = this.resolutionCode;
    info.notes = this.resolutionNotes;
    info.resolvedAt = new Date();
    // this.api.ResolveIssue(this.issue.issueID, info);
    this.ref.close();
  }
}
