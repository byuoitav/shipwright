import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { MatTableDataSource } from '@angular/material';
import { RoomStatus } from 'src/app/objects/static';
import { DataSource } from '@angular/cdk/table';

@Component({
  selector: 'room-state',
  templateUrl: './room-state.component.html',
  styleUrls: ['./room-state.component.scss']
})
export class RoomStateComponent implements OnInit {
  dataSource: MatTableDataSource<RoomStatus>
  columns = ["type","roomID","alerts","devices"]
  constructor(public data: DataService) {
   if (this.data.finished){
     this.dataSource=new MatTableDataSource(this.data.roomStatusList)
   }
   else{
     this.data.loaded.subscribe(() => {
      this.dataSource=new MatTableDataSource(this.data.roomStatusList)
      console.log("list in datasource:", this.dataSource)
      })}
   }
   
  ngOnInit() {
  }

}
