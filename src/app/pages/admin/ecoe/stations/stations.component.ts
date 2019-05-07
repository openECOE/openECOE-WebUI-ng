import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiService} from '../../../../services/api/api.service';
import {SharedService} from '../../../../services/shared/shared.service';
import {map} from 'rxjs/operators';
import {Item, Pagination} from '@infarm/potion-client';
import {Station} from '../../../../models/ecoe';
import {forkJoin, from} from 'rxjs';

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

  page: number = 1;
  pagesNum: number = 0;
  pagesTotal: number = 0;
  perPage: number = 10;

  pagStations: any;

  loading: boolean = false;

  constructor(private apiService: ApiService,
              private route: ActivatedRoute,
              private router: Router,
              public shared: SharedService) {
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
    this.loading = true;
    const excludeItems = ['ecoe', 'organization'];

    Station.query({
      where: {ecoe: this.ecoeId},
      sort: {order: false},
      page: this.page,
      perPage: this.perPage
    }, {skip: excludeItems, paginate: true, cache: false})
      .then(response => {
        this.editCache = {};
        this.pagStations = response;

        this.stations = this.pagStations.items;
        this.pagesTotal = this.pagStations.total;
        this.updateEditCache();
        console.log(this.pagesTotal, 'Stations loaded', this.stations);
      }).finally(() => this.loading = false);
  }

  /**
   * Adds to the resource passed its array of qblocks as a new key object.
   * Then updates the qblocks cache.
   *
   * @param expandOpen State of the expanded sub-table
   * @param station Resource selected to show its qblocks
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
    const defaultStation = {
      name: '',
      ecoe: this.ecoeId,
    };

    const newStation = new Station(defaultStation);

    this.stations = [...this.stations, newStation];

    this.editCache[-1] = {
      edit: true,
      new_item: true,
      ...newStation
    };
  }

  /**
   * Sets the editCache variable to true.
   * Changes text-view tags by input tags.
   *
   * @param id Id of the selected resource
   */
  startEdit(id: number) {
    this.editCache[id].edit = true;
  }

  /**
   * Calls ApiService to delete the resource passed.
   * Then calls [updateArrayStations]{@link #updateArrayStations} function.
   *
   * @param station Resource selected
   */
  deleteItem(station: Station) {
    const stationId: number = station.id;

    station.destroy()
      .then(() => this.updateArrayStations(stationId));
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
   * @param station Resource selected
   * @param newItem determines if the resource is already saved
   */
  saveItem(station: Station, newItem: boolean): void {
    const item = this.editCache[station.id];

    if (!item.name) {
      return;
    }

    const body = {
      name: item.name,
      ecoe: item.ecoe
    };

    const request = (
      newItem ?
        station.save() :
        station.update(body)
    );

    from(request).subscribe(response => {
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
   * @param station Resource selected
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
   * @param station Id of the resource passed
   */
  updateArrayStations(station: number) {
    delete this.editCache[station];
    this.stations = this.stations.filter(x => x.id !== station);
  }

  /**
   * Navigates to Questions page with the queryParams of the Station and Qblock for filtering.
   *
   * @param stationId Id of the station selected
   * @param qblockId Id of the qblock selected
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
   * @param station Parent resource passed
   * @param name? Name of the Qblock
   */
  addQblock(station: any, name?: string) {
    this.apiService.getResources('qblock')
      .subscribe(qblocks => {
        this.indexQblock += this.shared.getLastIndex(qblocks);

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
   * @param qblockId Id of the selected resource
   */
  startEditQblock(qblockId: number) {
    this.editCacheQblock[qblockId].edit = true;
  }

  /**
   * Calls ApiService to delete the resource passed.
   * Then calls [updateArrayQblocks]{@link #updateArrayQblocks} function.
   *
   * @param qblock Resource selected
   * @param station Parent resource passed
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
   * @param qblock Resource selected
   * @param station Parent resource passed
   * @param newItem determines if the resource is already saved
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
        .sort(this.shared.sortArray);
    });
  }

  /**
   * Sets the editCache variable to false.
   * If resource is not already saved, calls [updateArrayQblocks]{@link #updateArrayQblocks} function.
   * Else resets editCache to the previous value.
   *
   * @param qblock Resource selected
   * @param station Parent resource passed
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
   * @param qblock Id of the resource passed
   * @param station Parent resource passed
   */
  updateArrayQblocks(qblock: number, station: any) {
    delete this.editCacheQblock[qblock];
    station.qblocksArray = station.qblocksArray
      .filter(x => x.id !== qblock)
      .sort(this.shared.sortArray);
  }

  importStations(parserResult: Array<any>) {
    const savePromises = [];

    for (let index = 0; index < parserResult.length; index++) {
      const value = parserResult[index];

      if (!value.order) {
        value.order = index + 1;
      }

      const body = {
        ...value,
        ecoe: this.ecoeId
      };

      const station = new Station(body);
      savePromises.push(station.save()
        .then(newStation => {
          console.log('Station', value.name, 'Saved', newStation);
          return newStation;
        })
        .catch(reason => {
          console.log('Station', value.name, 'Not Saved', body, reason);
          return reason;
        }));
    }
    // TODO: Review promises not resolved in some cases
    Promise.all(savePromises)
      .then(result => {
        console.log('All Stations Imported', result);
      })
      .finally(() => this.loadStations());
  }

  pageChange(page: number) {
    this.pagStations.page = page;
    this.loadStations();
    // this.pagStations.changePageTo(page)
    //   .then(value => this.stations = value.items);
  }

  pageSizeChange(pageSize: number) {
    this.perPage = pageSize;
    this.loadStations();
  }

}
