import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiService} from '../../../services/api/api.service';
import {SharedService} from '../../../services/shared/shared.service';
import {map} from 'rxjs/operators';

/**
 * Component with stations and qblocks by station.
 */
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

  /**
   * Load stations by the passed ECOE.
   * Then calls [updateEditCache]{@link #updateEditCache} function.
   */
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

  /**
   * Adds to the resource passed its array of qblocks as a new key object.
   * Then updates the qblocks cache.
   *
   * @param {boolean} expandOpen State of the expanded sub-table
   * @param {any} station Resource selected to show its qblocks
   */
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

  /**
   * Adds a new empty field to the resources array.
   * Then updates editCache with the new resource.
   */
  addStation() {
    this.apiService.getResources('station')
      .subscribe(stations => {
        this.index += this.sharedService.getLastIndex(stations);

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

  /**
   * Sets the editCache variable to true.
   * Changes text-view tags by input tags.
   *
   * @param {number} id Id of the selected resource
   */
  startEdit(id: number) {
    this.editCache[id].edit = true;
  }

  /**
   * Calls ApiService to delete the resource passed.
   * Then calls [updateArrayStations]{@link #updateArrayStations} function.
   *
   * @param {any} station Resource selected
   */
  deleteItem(station: any) {
    this.apiService.deleteResource(station['$uri']).subscribe(() => {
      this.updateArrayStations(station.id);
    });
  }

  /**
   * Updates editCache variable with the same values of the resources array and adds a 'edit' key.
   */
  updateEditCache(): void {
    this.stations.forEach(item => {
      this.editCache[item.id] = {
        edit: this.editCache[item.id] ? this.editCache[item.id].edit : false,
        ...item
      };
    });
  }

  /**
   * Creates or updates the resource passed.
   * Then updates the variables to avoid calling the backend again.
   * If the station is created, adds a Qblock by default
   *
   * @param {any} station Resource selected
   * @param {boolean} newItem determines if the resource is already saved
   */
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

    request.pipe(
      map(res => {
        return {...res, expand: true};
      })
    ).subscribe(response => {
      delete this.editCache[station.id];
      delete this.editCache[response['id']];

      this.editCache[response['id']] = {
        edit: false,
        ...response
      };

      this.stations = this.stations.map(x => (x.id === station.id) ? response : x);

      if (newItem) {
        const newStation = this.stations.find(x => x.id === response.id);
        newStation.qblocksArray = [];
        this.addQblock(newStation, 'Preguntas Generales');
      }
    });
  }

  /**
   * Sets the editCache variable to false.
   * If resource is not already saved, calls [updateArrayStations]{@link #updateArrayStations} function.
   * Else resets editCache to the previous value.
   *
   * @param {any} station Resource selected
   */
  cancelEdit(station: any): void {
    this.editCache[station.id].edit = false;

    if (this.editCache[station.id].new_item) {
      this.updateArrayStations(station.id);
    } else {
      this.editCache[station.id] = station;
    }
  }

  /**
   * Deletes the editCache key assigned to the resource id passed and filters out the item from the resources array.
   *
   * @param {number} station Id of the resource passed
   */
  updateArrayStations(station: number) {
    delete this.editCache[station];
    this.stations = this.stations.filter(x => x.id !== station);
  }

  /**
   * Navigates to Questions page with the queryParams of the Station and Qblock for filtering.
   *
   * @param {number} stationId Id of the station selected
   * @param {number} qblockId Id of the qblock selected
   */
  navigateQuestions(stationId: number, qblockId: number) {
    this.router.navigate(['../questions'], {
      relativeTo: this.route,
      queryParams: {station: stationId, qblock: qblockId}
    });
  }

  /**
   * Adds a new empty field to the resources array.
   * Then updates editCache with the new resource.
   *
   * @param {any} station Parent resource passed
   * @param {string} name? Name of the Qblock
   */
  addQblock(station: any, name?: string) {
    this.apiService.getResources('qblock')
      .subscribe(qblocks => {
        this.indexQblock += this.sharedService.getLastIndex(qblocks);

        const newItem = {
          id: this.indexQblock,
          order: '',
          name: name || '',
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

  /**
   * Sets the editCache variable to true.
   * Changes text-view tags by input tags.
   *
   * @param {number} qblockId Id of the selected resource
   */
  startEditQblock(qblockId: number) {
    this.editCacheQblock[qblockId].edit = true;
  }

  /**
   * Calls ApiService to delete the resource passed.
   * Then calls [updateArrayQblocks]{@link #updateArrayQblocks} function.
   *
   * @param {any} qblock Resource selected
   * @param {any} station Parent resource passed
   */
  deleteQblock(qblock: any, station: any) {
    this.apiService.deleteResource(qblock['$uri']).subscribe(() => {
      this.updateArrayQblocks(qblock.id, station);
    });
  }

  /**
   * Creates or updates the resource passed.
   * Then updates the variables to avoid calling the backend again.
   *
   * @param {any} qblock Resource selected
   * @param {number} station Parent resource passed
   * @param {boolean} newItem determines if the resource is already saved
   */
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

  /**
   * Sets the editCache variable to false.
   * If resource is not already saved, calls [updateArrayQblocks]{@link #updateArrayQblocks} function.
   * Else resets editCache to the previous value.
   *
   * @param {any} qblock Resource selected
   * @param {any} station Parent resource passed
   */
  cancelEditQblock(qblock: any, station: any) {
    this.editCacheQblock[qblock.id].edit = false;
    if (this.editCacheQblock[qblock.id].new_item) {
      this.updateArrayQblocks(qblock.id, station);

    } else {
      this.editCacheQblock[qblock.id] = qblock;
    }
  }

  /**
   * Deletes the editCache key assigned to the resource id passed and filters out the item from the resources array.
   *
   * @param {number} qblock Id of the resource passed
   * @param {any} station Parent resource passed
   */
  updateArrayQblocks(qblock: number, station: any) {
    delete this.editCacheQblock[qblock];
    station.qblocksArray = station.qblocksArray
      .filter(x => x.id !== qblock)
      .sort(this.sharedService.sortArray);
  }
}
