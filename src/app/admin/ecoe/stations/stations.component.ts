import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiService} from '../../../services/api/api.service';
import {SharedService} from '../../../services/shared/shared.service';

@Component({
  selector: 'app-stations',
  templateUrl: './stations.component.html',
  styleUrls: ['./stations.component.less']
})
export class StationsComponent implements OnInit {

  stations: any[] = [];
  ecoeId: number;
  editCache = {};
  editCacheQblock = {};
  index: number = 1;
  indexQblock: number = 1;

  constructor(private apiService: ApiService,
              private route: ActivatedRoute,
              private router: Router,
              private sharedService: SharedService) {
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

  loadQblocksByStation(expandOpen: boolean, station: any) {
    if (expandOpen) {
      this.apiService.getResources('qblock', {
        where: `{"station":${station.id}}`,
        sort: '{"order":false}'
      }).subscribe(qblocks => {
        station.qblocksArray = qblocks;

        station.qblocksArray.forEach(qblock => {
          this.editCacheQblock[qblock.id] = {
            edit: this.editCacheQblock[qblock.id] ? this.editCacheQblock[qblock.id].edit : false,
            ...qblock
          };
        });
      });
    }
  }

  addStation() {
    this.apiService.getResources('station')
      .subscribe(stations => {
        this.index += stations.reduce((max, p) => p.id > max ? p.id : max, stations[0].id);

        const newItem = {
          id: this.index,
          order: '',
          name: '',
          ecoe: this.ecoeId,
          children_stations: [],
          parent_station: null
        };

        this.stations = [...this.stations, newItem];

        this.editCache[this.index] = {
          edit: true,
          new_item: true,
          ...newItem
        };
      });
  }

  startEdit(id: number) {
    this.editCache[id].edit = true;
  }

  deleteItem(station: any) {
    this.apiService.deleteResource(station['$uri']).subscribe(() => {
      this.updateArrayStations(station.id);
    });
  }

  updateEditCache(): void {
    this.stations.forEach(item => {
      this.editCache[item.id] = {
        edit: this.editCache[item.id] ? this.editCache[item.id].edit : false,
        ...item
      };
    });
  }

  saveItem(station: any, newItem: boolean): void {
    const item = this.editCache[station.id];

    if (!item.order || !item.name) {
      return;
    }

    const body = {
      order: +item.order,
      name: item.name,
      ecoe: item.ecoe
    };

    const request = (
      newItem ?
        this.apiService.createResource('station', body) :
        this.apiService.updateResource(item['$uri'], body)
    );

    request.subscribe(response => {
      delete this.editCache[station.id];
      delete this.editCache[response['id']];

      this.editCache[response['id']] = {
        edit: false,
        ...response
      };

      this.stations = this.stations.map(x => (x.id === station.id) ? response : x);
    });
  }

  cancelEdit(station: any): void {
    this.editCache[station.id].edit = false;

    if (this.editCache[station.id].new_item) {
      this.updateArrayStations(station.id);
    } else {
      this.editCache[station.id] = station;
    }
  }

  updateArrayStations(station: number) {
    delete this.editCache[station];
    this.stations = this.stations.filter(x => x.id !== station);
  }

  navigateQuestions(stationId: number, qblockId: number) {
    this.router.navigate(['../questions'], {
      relativeTo: this.route,
      queryParams: {station: stationId, qblock: qblockId}
    });
  }

  addQblock(station: any) {
    this.apiService.getResources('qblock')
      .subscribe(qblocks => {
        this.indexQblock += qblocks.reduce((max, p) => p.id > max ? p.id : max, qblocks[0].id);

        const newItem = {
          id: this.indexQblock,
          order: '',
          name: '',
          questions: [],
          station: station.id
        };

        station.qblocksArray = [...station.qblocksArray, newItem];

        this.editCacheQblock[this.indexQblock] = {
          edit: true,
          new_item: true,
          ...newItem
        };
      });
  }

  startEditQblock(qblockId: number) {
    this.editCacheQblock[qblockId].edit = true;
  }

  deleteQblock(qblock: any, station: any) {
    this.apiService.deleteResource(qblock['$uri']).subscribe(() => {
      this.updateArrayQblocks(qblock.id, station);
    });
  }

  saveQblock(qblock: any, station: any, newItem: boolean) {
    const item = this.editCacheQblock[qblock.id];

    if (!item.order || !item.name) {
      return;
    }

    const body = {
      order: +item.order,
      name: item.name,
      station: station.id
    };

    const request = (
      newItem ?
        this.apiService.createResource('qblock', body) :
        this.apiService.updateResource(item['$uri'], body)
    );

    request.subscribe(response => {
      delete this.editCacheQblock[qblock.id];
      delete this.editCacheQblock[response['id']];

      this.editCacheQblock[response['id']] = {
        edit: false,
        ...response
      };

      station.qblocksArray = station.qblocksArray
        .map(x => (x.id === qblock.id ? response : x))
        .sort(this.sharedService.sortArray);
    });
  }

  cancelEditQblock(qblock: any, station: any) {
    this.editCacheQblock[qblock.id].edit = false;
    if (this.editCacheQblock[qblock.id].new_item) {
      this.updateArrayQblocks(qblock.id, station);

    } else {
      this.editCacheQblock[qblock.id] = qblock;
    }
  }

  updateArrayQblocks(qblock: number, station: any) {
    delete this.editCacheQblock[qblock];
    station.qblocksArray = station.qblocksArray
      .filter(x => x.id !== qblock)
      .sort(this.sharedService.sortArray);
  }
}
