import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { MatTableDataSource } from '@angular/material';
import { CombinedRoomState } from 'src/app/objects/static';
import { DataSource } from '@angular/cdk/table';
import { StringsService } from 'src/app/services/strings.service';

@Component({
  selector: 'room-state',
  templateUrl: './room-state.component.html',
  styleUrls: ['./room-state.component.scss']
})
export class RoomStateComponent implements OnInit {
  dataSource: MatTableDataSource<CombinedRoomState>
  columns = ["type","roomID","alerts","devices"]
  constructor(public data: DataService, public text: StringsService) {
   if (this.data.finished){
    console.log("Got the data")
    this.dataSource=new MatTableDataSource(this.data.combinedRoomStateList)
   }
   else{
     this.data.loaded.subscribe(() => {
     console.log("Subscribed to get the data")
     this.dataSource=new MatTableDataSource(this.data.combinedRoomStateList)
     console.log("list in datasource:", this.dataSource)
      })}
   }
   
  ngOnInit() {
  }

}
