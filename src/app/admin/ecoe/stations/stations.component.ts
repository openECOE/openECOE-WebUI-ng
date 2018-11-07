import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiService} from '../../../services/api/api.service';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-stations',
  templateUrl: './stations.component.html',
  styleUrls: ['./stations.component.less']
})
export class StationsComponent implements OnInit {

  stations: any[];
  ecoeId: number;
  editCache = {};

  constructor(private apiService: ApiService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit() {
    this.ecoeId = +this.route.snapshot.params.id;
    this.loadStations();
  }

  loadStations() {
    this.apiService.getResources('station', {
      where: `{"ecoe":${this.ecoeId}}`,
      sort: '{"order":false}'
    }).subscribe(response => {
      this.editCache = {};
      this.stations = response;
      this.updateEditCache();
    });
  }

  loadQblocksByStation(expandOpen: boolean, stationId: number) {
    if (expandOpen) {
      this.apiService.getResources('qblock', {
        where: `{"station":${stationId}}`,
        sort: '{"order":false}'
      }).pipe(
        map(qblocks => {
          return qblocks.map(qblock => {
            return {stationId, ...qblock};
          });
        })
      ).subscribe(qblocks => {
        this.stations = this.stations.map(station => {
          if (station.id === stationId) {
            station.qblocksArray = qblocks;
          }

          return station;
        });

        this.updateEditCache();
      });
    }
  }

  loadQuestionsByQblock(expandOpen: boolean, qblockId: number) {
    if (expandOpen) {
      this.apiService.getResources('question', {
        where: `{"qblocks":{"$contains":${qblockId}}`,
        sort: '{"order":false}'
      }).pipe(
        map(qblocks => {
          return qblocks.map(qblock => {
            return {qblockId, ...qblock};
          });
        })
      ).subscribe(qblocks => {
        this.stations = this.stations.map(station => {
          if (station.id === qblockId) {
            station.qblocksArray = qblocks;
          }

          return station;
        });

        this.updateEditCache();
      });
    }
  }

  deleteItem(ref: string) {
    this.apiService.deleteResource(ref);
  }

  updateEditCache(): void {
    this.stations.forEach(item => {
      this.editCache[item.id] = {
        edit: this.editCache[item.id] ? this.editCache[item.id].edit : false,
        ...item
      };
    });
  }
}
