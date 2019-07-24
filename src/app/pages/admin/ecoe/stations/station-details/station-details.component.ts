import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {QBlock, Question, Station} from '../../../../../models';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {RowQblock} from '../../questions/questions.component';
import {Location} from '@angular/common';
import * as Q from 'q';
import {FormService} from '../../../../../services/form/form.service';

@Component({
  selector: 'app-station-details',
  templateUrl: './station-details.component.html',
  styleUrls: ['./station-details.component.less']
})
export class StationDetailsComponent implements OnInit {

  private id_station: number;
  private station: any;

  @ViewChild('question') questionRef;
  @ViewChild('qblock') qblockRef;

  stations: Station[] = [];
  editCache: { edit: boolean, new_item: boolean, item: QBlock, expand?: boolean }[] = [];

  qblockForm: FormGroup;
  control: FormArray;

  rowQblock: RowQblock = {
    name: ['', Validators.required]
  };

  pagQblocks: any;
  pagStations: any;
  page: number = 1;
  totalItems: number = 0;
  perPage: number = 20;

  loading: boolean;
  defaultExpand: boolean = false;

  qblocks: QBlock[] = [];

  isVisible: boolean = false;

  logPromisesERROR: any[] = [];
  logPromisesOK: any[] = [];

  private qblocksToAdd: QBlock[] = [];
  private questionsToAdd: any[] = [];

  /* FORM STEPS SETTINGS --START */

  current = 0;

  index = 'First-content';


  pre(): void {
    this.current -= 1;
    this.changeContent();
  }

  next(): void {
    this.current += 1;
    this.changeContent();
  }

  done(): void {
    console.log('done');
  }

  changeContent(): void {
    switch (this.current) {
      case 0: {
        this.index = 'First-content';
        break;
      }
      case 1: {
        this.index = 'Second-content';
        break;
      }
      case 2: {
        this.index = 'third-content';
        break;
      }
      default: {
        this.index = 'error';
      }
    }
  }


  /* FORM STEPS SETTINGS --END */

  constructor(private route: ActivatedRoute,
              private fb: FormBuilder,
              private location: Location,
              private formService: FormService) { }

   ngOnInit() {

    this.id_station = parseInt(this.route.snapshot.paramMap.get('id'), 10);
    Station.first({where: {$uri: `/api/v1/stations/${this.id_station}`}}).then(response => this.station = response);

    this.qblockForm = this.fb.group({
      qblockRow: this.fb.array([])
    });

    this.control = <FormArray>this.qblockForm.controls.qblockRow;

    this.getQblocks();

    this.InitQblockRow();

    this.formService.receiveValues()
      .subscribe(value => console.log('received options: ', value));
  }

   getQblocks() {
     this.loading = true;

      QBlock.query({
        where: {station: this.id_station},
        sort: {order: false},
        page: this.page,
        perPage: this.perPage
      }, {
        paginate: true, cache: false
      })
        .then((response: any) => {
          this.editCache = [];
          this.loadPage(response);
          this.loading = false;
        });
    }
  /**
   * Fired when the current page is changed
   * @param pageNum number of the new page.
   */
  pageChange(pageNum: number) { console.log('pageChange:LoadPage');
    this.loading = true;
    this.pagStations.page = pageNum;
    this.pagStations.changePageTo(pageNum)
      .then(retPage => this.loadPage(retPage))
      .finally(() => this.loading = false);
  }

  /**
   * When the stations are loaded, is fired for update
   * some variables.
   * @param pagination is a object type with all info about the current page.
   */
  loadPage(pagination: any) {
    this.pagQblocks = pagination;
    this.qblocks = [...this.pagQblocks.items];
    this.totalItems = this.pagQblocks.total;
    this.updateEditCache();
  }

  /**
   * Updates editCache variable with the same values of the resources array and adds a 'edit' key.
   */
  updateEditCache(): void {
    this.qblocks.forEach( (item: QBlock)  => {
      this.editCache[item.id] = {
        edit: this.editCache[item.id] ? this.editCache[item.id].edit : false,
        new_item: false,
        item: Object.create(item),  // (Object.create(item)) as QBlock,
        expand: this.defaultExpand
      };
    });
  }

  /**
   * Fired when the number of item per page is changed
   * @param pageSize new number of item per page.
   */
  pageSizeChange(pageSize: number) {
    this.perPage = pageSize;
    this.getQblocks();
  }



  /**
   * Sets the editCache variable to true.
   * Changes text-view tags by input tags.
   *
   * @param item selected resource of stations list
   */
  startEdit(item: QBlock) {   console.log('StartEdit:qblock', item, this.editCache[item.id]);
    this.editCache[item.id].edit = true;
  }

  /**
   * Calls ApiService to delete the resource passed.
   * Then calls [updateArrayStations]{@link #updateArrayStations} function.
   *
   * @param qblock Resource selected
   */
  deleteItem(qblock: any) {
    qblock.destroy()
      .then(() => {
        this.getQblocks();
      });
  }

  /**
   * Creates or updates the resource passed.
   * Then updates the variables to avoid calling the backend again.
   * If the station is created, adds a Qblock by default
   *
   * @param cacheItem Resource selected
   */
  updateItem(cacheItem: any): void { console.log('updateItem()', cacheItem);
    if (!cacheItem.name) {
      return;
    }

    const body = {
      name: cacheItem.name,
      order: cacheItem.order,
      // station: cacheItem.station
    };

    const request = cacheItem.update(body);

    request.then(response => {
      this.qblocks = this.qblocks.map(x => (x.id === cacheItem.id) ? response : x);
      this.editCache[cacheItem.id].edit = false;
    });
    request.catch( err => console.error(err));
  }


  /**
   * Creates or updates the resource passed.
   * Then updates the variables to avoid calling the backend again.
   * If the station is created, adds a Qblock by default
   *
   * @param cacheItem Resource selected
   */
/*  updateItem(cacheItem: any): void { console.log('updateItem()', cacheItem);
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
  }*/

  cancelEdit(item: any): void {
    this.editCache[item.id].edit = false;
    this.editCache[item.id].item = Object.create(item);
  }

  /**
   * Opens form window to add new qblock/s
   */
  showDrawer() {
    this.isVisible = true;
  }

  /**
   * Removes the Qblock filter and reloads the page by updating the URL.
   *
   * @param station Id of the station passed
   */
/*  deleteFilter(station: number) {
    console.log('deleteFilter:', station);
    /!*this.router.navigate(['../questions'], {
      relativeTo: this.route,
      replaceUrl: true,
      queryParams: {station: station}
    }).finally();*!/
  }*/

  /**
   * Resets the array of promise errors when tried to save on
   * data base.
   */
  clearImportErrors() {
    this.logPromisesERROR = [];
  }

  /**
   * Closes the form qblock window
   */
  closeDrawer() {
    this.isVisible = false;
  }

  /**
   * Adds new row (name field) qblock to the form
   */
  addQblockRow() {
    this.control.push(this.fb.group(this.rowQblock));
  }

  /**
   * Obtains de formControl instance of any element in our form.
   * @param name of the field, in our case can be 'name' or 'code'
   * @param idx the index of the field.
   */
  getFormControl(name: string, idx: number): AbstractControl {
    return this.qblockForm.get('qblockRow')['controls'][idx].controls[name];
  }

  /**
   *At first time when OnInit, adds new qblock row;
   * in other cases resets the number of rows to 1 when the
   * form window was closed.
   */
  InitQblockRow() {
    if (this.control.length === 0) {
      this.addQblockRow();
    } else {
      while (this.control.length > 1) {
        this.control.removeAt(1);
      }
      this.control.reset();
    }
  }

  /**
   * Deletes selected row qblock whose was added previously
   * @param index id field to find and remove.
   */
  deleteRow(index) {
    this.control.removeAt(index);
  }

  /**
   * When user decides do not save the form values and
   * close the form window: will close the drawer window
   * and reset the number of row qblocks.
   */
  cancelForm() {
    this.closeDrawer();
    this.InitQblockRow();
  }

  /**
   * Saves array of data in data base. The data can be provided from external file or from
   * multiple rows form.
   * @param items obtained from form array or array form.
   */
  saveArrayQblocks(items: any[]): Promise<any> {
    const savePromises = [];
    this.logPromisesERROR = [];
    this.logPromisesOK = [];

    items.forEach((item, idx) => {
      if (item.name) {
        item['station'] = this.id_station;
        item['order'] = this.qblocks.length + idx;

        const qblock = new QBlock(item);

        const promise = qblock.save()
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
    });

    return Promise.all(savePromises)
      .then(() =>
        new Promise((resolve, reject) =>
          this.logPromisesERROR.length > 0 ? reject(this.logPromisesERROR) : resolve(items)))
      .catch(err => new Promise(((resolve, reject) => reject(err))));
  }

  submitQblocks() {
    if (this.qblockRef.submitForm()) {
      this.next();
    }
  }

  submitQuestions() {
    // if (this.questionRef.submitForm()) { console.log('station-details:onSubmit');
    if (this.questionRef.toSave()) { console.log('station-details:onSubmit');

    }
  }

  /**
   * Before save values in data base, in first time checks that
   * all fields are validates and then will save the values.
   */
  submitForm(): void { console.log('click en submit');
    /*for (const i in this.qblockForm.get('qblockRow')['controls']) {
      if (this.qblockForm.get('qblockRow')['controls'].hasOwnProperty(i)) {
        this.getFormControl('name', +i).markAsDirty();
        this.getFormControl('name', +i).updateValueAndValidity();
      }
    }*/
   /* console.log(this.qblockForm);*/
    // if (this.qblockRef.submitForm()) { console.log('qblock-form-ok:onSubmit');
      if (this.questionRef.mySubmit()) { console.log('station-details:onSubmit');
        /*this.saveArrayQblocks(this.qblockForm.get('qblockRow').value)
          .finally(() => {
            this.getQblocks();
            this.closeDrawer();
            this.InitQblockRow();
          });*/
      }
    // }
  }

  onBack() {
    this.location.back();
  }

  onGetQblocks(data: QBlock[]) {
    console.log('onGetQblocks: ', data);
    this.qblocksToAdd = data;
  }

  onGetQuestions(data: any[]) {
    console.log('onGetQuestions: ', data);
    this.questionsToAdd = data;
  }

}
