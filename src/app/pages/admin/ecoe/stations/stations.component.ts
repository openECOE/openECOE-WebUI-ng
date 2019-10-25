import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {SharedService} from '../../../../services/shared/shared.service';
import {TranslateService} from '@ngx-translate/core';
import {RowStation, Station} from '../../../../models';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {getPotionID} from '@openecoe/potion-client';

/**
 * Component with stations and qblocks by station.
 */
@Component({
  selector: 'app-stations',
  templateUrl: './stations.component.html',
  styleUrls: ['./stations.component.less']
})

export class StationsComponent implements OnInit {

  private stations: Station[] = [];
  private ecoeId: number;
  private editCache: { edit: boolean, new_item: boolean, item: Station }[] = [];
  public  index: number = 1;
  private page: number = 1;
  private totalItems: number = 0;
  private perPage: number = 10;
  private pagStations: any;
  private loading: boolean = false;
  private isVisible: boolean;
  private stationForm: FormGroup;
  private control: FormArray;
  private selectOptions: any [] = [];
  private rowStation: RowStation = {
    order: [''],
    name: ['', Validators.required],
    parentStation: ['']
  };

  logPromisesERROR: any[] = [];
  logPromisesOK: any[] = [];

  readonly EXCLUDE_ITEMS = [];

  constructor(private route: ActivatedRoute,
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
  }

  /**
   * Updates new results for parent select options
   * @param value string to search
   * @param exclude item to exclude form select
   */
  searchInSelect(value: string, exclude?: string): void {
    if (value) {
      Station.query({
        where: {
          'ecoe': this.ecoeId,
          'name': {'$contains': value}
        },
        sort: {'order': false},
        page: 1,
        perPage: 50
      }, {paginate: true, cache: false})
        .then(response => {
          this.updateOptions(response, exclude).finally();
        });
    } else {
      this.loadOptions4Select(exclude).finally();
    }
  }

  onBack() {
    this.router.navigate(['./home']).finally();
  }

  updateOptions(response: any, exclude?: string) {
    this.selectOptions = response;
    for (const row of (this.stationForm.get('stationRow').value)) {
      if (row.name) {
        this.selectOptions['items'].push(new Station({name: row.name}));
      }
    }
    // deleting current station in parent stations list.
    if (exclude) {
      const idx = this.selectOptions['items'].map(e => e.name).indexOf(exclude);
      if (idx > -1) {
        this.selectOptions['items'].splice(idx, 1);
      }
    }

    return new Promise( resolve => resolve(this.selectOptions));
  }

  /**
   * Load stations by the passed ECOE.
   * Then calls [updateEditCache]{@link #updateEditCache} function.
   */
  loadStations() {
    this.loading = true;

    return new Promise(resolve => {
      Station.query({
        sort: {order: false},
        page: this.page,
        perPage: this.perPage
      }, {paginate: true, cache: false})
        .then(response => {
          this.editCache = [];
          this.loadPage(response);
        })
        .catch(err => {
          if (err.status === 404) {
            this.page--;
            if (this.page > 0) {
              this.loadStations().finally();
            }
          }
        })
        .finally(() => {
          this.loading = false;
          resolve();
        });
    });
  }

  /**
   * Load options for parent station select. By default gets the first 20 results
   * and when user starts to write, the results will update calling [searchInSelect]{@link #searchInSelect}
   */
  loadOptions4Select(excludeItem: string = null, page: number = 1 ) {
      return Station.query({
        where: {'ecoe': this.ecoeId},
        sort: {'order': false},
        page: page,
        perPage: 50
      }, {skip: this.EXCLUDE_ITEMS, paginate: true, cache: false})
        .then(response => {
          return this.updateOptions(response, excludeItem);
        });
  }

  /**
   * Sets the editCache variable to true.
   * Changes text-view tags by input tags.
   *
   * @param item selected resource of stations list
   * @param excludeItem exclude himself item
   */
  startEdit(item: Station, excludeItem?: string) {
    this.editCache[item.id].edit = true;
    this.loadOptions4Select(excludeItem).finally();
  }

  /**
   * Calls destroy to delete the resource passed.
   * Then calls [updateArrayStations]{@link #updateArrayStations} function.
   *
   * @param station Resource selected
   */
  deleteItem(station: Station) {
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
    this.stations.forEach((item) => {
      this.editCache[item.id] = {
        edit: this.editCache[item.id] ? this.editCache[item.id].edit : false,
        new_item: false,
        item: Object.create(item)
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
  updateItem(cacheItem: any): void {
    if (!cacheItem.name) {
      return;
    }

    const body = {
      name: cacheItem.name,
      ecoe: this.ecoeId,
      parentStation: (cacheItem.parentStation) ? cacheItem.parentStation.id : null
    };

    const request = cacheItem.update(body);

    request.then(response => {
      this.stations = this.stations.map(x => (x.id === cacheItem.id) ? response : x);
      this.editCache[cacheItem.id].edit = false;
    });
  }

  /**
   * Sets the editCache variable to false.
   * If resource is not already saved, calls [updateArrayStations]{@link #updateArrayStations} function.
   * Else resets editCache to the previous value.
   *
   * @param item Resource selected
   */
  cancelEdit(item: any): void {
    this.editCache[item.id].edit = false;
    this.editCache[item.id].item = Object.create(item);
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
   * Fired when the current page is changed
   * @param pageNum number of the new page.
   */
  pageChange(pageNum: number) {
    this.loading = true;
    this.pagStations.page = pageNum;
    this.pagStations.changePageTo(pageNum)
      .then(retPage => this.loadPage(retPage))
      .finally(() => this.loading = false);
  }

  /**
   * Fired when the number of item per page is changed
   * @param pageSize new number of item per page.
   */
  pageSizeChange(pageSize: number) {
    this.perPage = pageSize;
    this.loadStations().finally();
  }

  /**
   * When the stations are loaded, is fired for update
   * some variables.
   * @param pagination is a object type with all info about the current page.
   */
  loadPage(pagination: any) {
    this.pagStations = pagination;
    this.stations = [...this.pagStations.items];
    this.totalItems = this.pagStations.total;
    this.updateEditCache();

    this.stations.map(value => {
      // Fix for SelfReference Station Type
      if (value.parentStation !== null && !value.parentStation.name) {
        Station.fetch<Station>(getPotionID(value.parentStation['$uri'], '/stations'))
          .then(parentStation => value.parentStation = parentStation);
      }
    });
  }

  /**
   * Opens form window to add new area/s
   */
  showDrawer() {
    this.isVisible = true;
    this.InitStationRow();
    this.loadOptions4Select().finally();

  }

  /**
   * Closes the form area window
   */
  closeDrawer() {
    this.isVisible = false;
  }

  /**
   * Resets the array of promise errors when tried to save on
   * data base.
   */
  clearImportErrors() {
    this.logPromisesERROR = [];
  }

  /**
   * Adds new row (name and order fields) station to the form
   */
  addStationRow() {
    this.control.push(this.fb.group(this.rowStation));
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
      while (this.control.length > 0) {
        this.control.removeAt(0);
      }
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
        .then(() => this.loadStations().finally())
        .finally(() => {
          this.closeDrawer();
          this.InitStationRow();
        });
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
   * Import stations from file
   * @param items rows readed from file
   */
  importStations(items: any[]) {
    this.saveArrayStations(items)
      .then(() => {
        this.loadStations().finally();
      })
      .catch(err => console.error('ERROR ON IMPORT:', err));
  }

  /**
   * Saves array of data in data base. The data can be provided from external file or from
   * multiple rows form.
   * @param items obtained from form array or array form.
   */
   private async saveArrayStations(items: any[]): Promise<any> {
    const savePromises = [];
    this.logPromisesERROR = [];
    this.logPromisesOK = [];

    let total = +this.totalItems;
    const withParent = [];

     for (const item of items) {
      if (item.name) {
        item['ecoe'] = this.ecoeId;

        if (!item.order) {
          item.order = ++total;
        }
        if (item.parentStation) { withParent.push(item); }

        const body = {
          name: item.name,
          order: item.order,
          ecoe: this.ecoeId
        };

        const station = new Station(body);

        const promise = await station.save()
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

     // SAVING PARENTS NAMES
    for (const item of withParent) {
      const primaryStation = await Station.first({where: {name: (item['name'] + ''), ecoe: this.ecoeId}});

      const body = {
        name: item.name,
        ecoe: this.ecoeId,
        parentStation: ((item.parentStation)
          ? (await Station.first({where: {name: (item['parentStation'] + ''), ecoe: this.ecoeId}}))['id']
          : null)
      };

      const station = await new Station(primaryStation).update(body)
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
      savePromises.push(station);
    }

    return Promise.all(savePromises)
      .then(() =>
        new Promise((resolve, reject) =>
          this.logPromisesERROR.length > 0 ? reject(this.logPromisesERROR) : resolve(items)))
      .catch(err =>
        new Promise(((resolve, reject) => reject(err))));
  }
}
