import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiService} from '../../../../services/api/api.service';
import {SharedService} from '../../../../services/shared/shared.service';
import {TranslateService} from '@ngx-translate/core';
import {RowStation, Station} from '../../../../models/ecoe';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';


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
  editCache: { edit: boolean, new_item: boolean, item: Station }[];
  editCacheQblock = {};
  index: number = 1;
  indexQblock: number = 1;

  page: number = 1;
  pagesNum: number = 0;
  totalItems: number = 0;
  perPage: number = 10;

  pagStations: any;

  loading: boolean = false;

  /* -- */
  isVisible: boolean;
  stationForm: FormGroup;
  control:  FormArray;

  rowStation: RowStation = {
    order:  ['', Validators.required],
    name:   ['', Validators.required],
    parentStation: ['']
  };

  data: object = {
    stationRow: [this.rowStation]
  };
  private logPromisesERROR: any[];
  private logPromisesOK: any[];

  constructor(private apiService: ApiService,
              private route: ActivatedRoute,
              private router: Router,
              private translate: TranslateService,
              public shared: SharedService,
              private fb: FormBuilder) {

    this.stationForm = this.fb.group({
      stationRow: this.fb.array([])
    });

    this.control = <FormArray>this.stationForm.controls.stationRow;
  }

  ngOnInit() {
    this.ecoeId = +this.route.snapshot.params.id;
    this.loadStations().finally();
    this.InitStationRow();
  }

  /**
   * Load stations by the passed ECOE.
   * Then calls [updateEditCache]{@link #updateEditCache} function.
   */
  loadStations() {
    this.loading = true;
    const excludeItems = ['ecoe', 'organization'];

    return new Promise(resolve => {
      Station.query({
        where: {ecoe: this.ecoeId},
        sort: {order: false},
        page: this.page,
        perPage: this.perPage
      }, {skip: excludeItems, paginate: true})
        .then(response => {
          this.editCache = [];
          this.loadPage(response);
          resolve();
          console.log(this.totalItems, 'Stations loaded', this.stations);
        }).finally(() => this.loading = false);
    });
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

  // TODO: Redo add Station module for use a modal or another page with steps tutorial

  /**
   * Adds a new empty field to the resources array.
   * Then updates editCache with the new resource.
   */
  addStation() {
    const index = this.stations.length;
    const defaultStation = {
      name: this.translate.instant('STATION') + ' ' + index,
      ecoe: this.ecoeId,
    };


    const newStation = new Station(defaultStation);


    this.stations = [...this.stations, newStation];

    this.editCache[index] = {
      edit: true,
      new_item: true,
      item: newStation
    };
  }

  /**
   * Sets the editCache variable to true.
   * Changes text-view tags by input tags.
   *
   * @param index of the selected resource
   */
  startEdit(index: number) {
    this.editCache[index].edit = true;
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
      .then(() => {
        this.loadStations()
          .then(() => this.updateEditCache());
      });
  }

  /**
   * Updates editCache variable with the same values of the resources array and adds a 'edit' key.
   */
  updateEditCache(): void {
    this.stations.forEach((item, index) => {
      this.editCache[index] = {
        edit: this.editCache[index] ? this.editCache[index].edit : false,
        new_item: false,
        item: item
      };
    });
  }

  /**
   * Creates or updates the resource passed.
   * Then updates the variables to avoid calling the backend again.
   * If the station is created, adds a Qblock by default
   *
   * @param cacheItem Resource selected
   */
  saveItem(cacheItem: any): void {
    if (!cacheItem.item.name) {
      return;
    }

    const body = {
      name: cacheItem.item.name,
      ecoe: cacheItem.item.ecoe
    };

    const request = (
      cacheItem.newItem ?
        cacheItem.item.save() :
        cacheItem.item.update(body)
    );

    request.then(response => {
      this.stations = this.stations.map(x => (x.id === cacheItem.item.id) ? response : x);

      cacheItem.newItem = cacheItem.edit = false;

      // if (newItem) {
      //   const newStation = this.stations.find(x => x.id === response.id);
      //   newStation.qblocksArray = [];
      //   this.addQblock(newStation, 'Preguntas Generales');
      // }
    });
  }

  /**
   * Sets the editCache variable to false.
   * If resource is not already saved, calls [updateArrayStations]{@link #updateArrayStations} function.
   * Else resets editCache to the previous value.
   *
   * @param cacheItem Resource selected
   */
  cancelEdit(cacheItem: any): void {
    // TODO: Review cancelEdit
    cacheItem.edit = false;

    if (cacheItem.new_item) {
      this.updateArrayStations(cacheItem);
    } else {
      cacheItem.item = this.stations.find(station => station.id === cacheItem.item.id);
    }
  }

  /**
   * Deletes the editCache key assigned to the resource id passed and filters out the item from the resources array.
   *
   * @param cacheItem of the resource passed
   */
  updateArrayStations(cacheItem: any) {
    const stationId = cacheItem.item.id;
    delete this.editCache[this.editCache.indexOf(cacheItem)];
    this.stations = this.stations.filter(x => x.id !== stationId);
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

      if (!value.name) {
        return;
      }

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
    this.loading = true;
    this.pagStations.page = page;
    this.pagStations.changePageTo(page)
      .then(retPage => this.loadPage(retPage))
      .finally(() => this.loading = false);
  }

  pageSizeChange(pageSize: number) {
    this.perPage = pageSize;
    this.loadStations();
  }

  loadPage(page: any) {
    this.pagStations = page;
    this.stations = [...this.pagStations.items];
    this.updateEditCache();
    this.totalItems = this.pagStations.total;
  }

  /* ---- */
  /**
   * Opens form window to add new area/s
   */
  showDrawer() {
    this.isVisible = true;
  }

  /**
   * Closes the form area window
   */
  closeDrawer() {
    this.isVisible = false;
  }

  /**
   * Adds new row (name and code fields) area to the form
   */
  addStationRow() {
    this.control.push( this.fb.group(this.rowStation) );
  }

  /**
   * Deletes selected row area whose was added previously
   * @param index id field to find and remove.
   */
  deleteRow(index) {
    this.control.removeAt(index);
  }


  /**
   *At first time when OnInit, adds new area row;
   * in other cases resets the number of rows to 1 when the
   * form window was closed.
   */
  InitStationRow() {
    if (this.control.length === 0) {
      this.addStationRow();
    } else {
      while (this.control.length > 1) { this.control.removeAt(1); }
      this.control.reset();
    }
  }

  /**
   * Obtains de formControl instance of any element in our form.
   * @param name of the field, in our case can be 'name' or 'code'
   * @param idx the index of the field.
   */
  getFormControl(name: string, idx: number): AbstractControl {
    return this.stationForm.get('stationRow')['controls'][idx].controls[name];
  }

  /**
   * Before save values in data base, in first time checks that
   * all fields are validates and then will save the values.
   */
  submitForm(): void {
    for (const i in this.stationForm.get('stationRow')['controls']) {
      if (this.stationForm.get('stationRow')['controls'].hasOwnProperty(i)) {
        this.getFormControl('order', +i).markAsDirty();
        this.getFormControl('order', +i).updateValueAndValidity();

        this.getFormControl('name', +i).markAsDirty();
        this.getFormControl('name', +i).updateValueAndValidity();
      }
    }
    if (this.stationForm.valid) {
      this.saveArrayStations(this.stationForm.get('stationRow').value)
        .then(result => console.log('SAVED:', result))
        .finally(() => {
          this.loadStations();
          this.closeDrawer();
          this.InitStationRow();
        });

      console.log('array okay:', this.stationForm.get('stationRow').value);
    }
  }

  /**
   * When user decides do not save the form values and
   * close the form window: will close the drawer window
   * and reset the number of row areas.
   */
  cancelForm() {
    this.closeDrawer();
    this.InitStationRow();
  }


    /**
     * Saves array of data in data base. The data can be provided from external file or from
     * multiple rows form.
     * @param items obtained from form array or array form.
     */
  saveArrayStations(items: any[]): Promise<any> {
    const savePromises    = [];
    this.logPromisesERROR = [];
    this.logPromisesOK    = [];

    for (const item of items) {
      if (item.order && item.name) {
        item['ecoe'] = this.ecoeId;
        item.parentStation = parseInt(item.parentStation, 10);

        const station = new Station(item);

        const promise = station.save()
          .then(result => {
            this.logPromisesOK.push(result);
            return result;
          })
          .catch(err => {
            this.logPromisesERROR.push({
              value: item,
              reason: err
            });
            return err;
          });
        savePromises.push(promise);
      }
    }

    return Promise.all(savePromises)
      .then(() =>
        new Promise((resolve, reject) =>
          this.logPromisesERROR.length > 0 ? reject(this.logPromisesERROR) : resolve(items)))
      .catch(err => new Promise(((resolve, reject) => reject(err))));
  }

}
