import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiService} from '@services/api/api.service';
import {SharedService} from '@services/shared/shared.service';
import {Area, EditCache, RowArea, ECOE} from '../../../models';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AREAS_TEMPLATE_URL} from '@constants/import-templates-routes';

/**
 * Component with areas and number of questions by area.
 */
@Component({
  selector: 'app-areas',
  templateUrl: './areas.component.html',
  styleUrls: ['./areas.component.less']
})
export class AreasComponent implements OnInit {
  readonly AREAS_URL = AREAS_TEMPLATE_URL;
  areas:        any[] = [];
  editCache:    EditCache[] = [];
  ecoeId:       number;
  ecoe:         ECOE;
  ecoe_name:    String;

  current_page: number = 1;
  per_page:     number = 10;
  totalItems:   number = 0;

  isVisible:    boolean = false;

  rowArea: RowArea = {
    name: ['', Validators.required],
    code: ['', Validators.required]
  };

  data: object = {
    areaRow: [this.rowArea]
  };

  areaForm:   FormGroup;
  control:  FormArray;

  logPromisesERROR: { value: any, reason: any }[] = [];
  logPromisesOK:    any[] = [];

  constructor(private apiService: ApiService,
              private route: ActivatedRoute,
              private router: Router,
              private sharedService: SharedService,
              private fb: FormBuilder) {

    this.areaForm = this.fb.group({
      areaRow: this.fb.array([])
    });

    this.control = <FormArray>this.areaForm.controls.areaRow;

  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.ecoeId = +params.ecoeId;
      ECOE.fetch<ECOE>(this.ecoeId, {cache: false}).then(value => {
        this.ecoe = value;
        this.ecoe_name = this.ecoe.name;

        const excludeItems = [];
        this.ecoe.areas({
          where: {'ecoe': this.ecoeId},
          page: this.current_page,
          perPage: this.per_page,
          sort: {$uri: false}
        }, {paginate: true, cache: false, skip: excludeItems})
        .then(response => {
          this.editCache = [];
          this.areas = response['items'].sort((a, b) => parseInt(a.code, 10) - parseInt(b.code, 10));
          this.totalItems = response['total'];
          this.updateEditCache();
        });
      });
    });
    this.InitAreaRow();
  }

  /**
   * Load areas by the passed ECOE.
   * Then calls [updateEditCache]{@link #updateEditCache} function.
   */
  loadAreas() {
    const excludeItems = [];

    Area.query({
      where: {'ecoe': this.ecoeId},
      page: this.current_page,
      perPage: this.per_page,
      sort: {$uri: false}
    }, {paginate: true, cache: false, skip: excludeItems})
      .then(response => {
        this.editCache = [];
        this.areas = response['items'].sort((a, b) => parseInt(a.code, 10) - parseInt(b.code, 10));
        this.totalItems = response['total'];
        this.updateEditCache();
      });
  }

  /**
   * Calls API to delete the resource passed.
   * Then calls [loadAreas]{@link #loadAreas} function.
   *
   * @param area Resource selected
   */
  deleteItem(area: Area) {
    area.destroy()
      .then( () => {
        this.loadAreas();
      })
      .catch(err => {
        console.log('Error on delete: ', err);
      });
  }

  /**
   * First, do copy of the selected object
   * to be modified and
   * Sets the editCache variable to true.
   * Changes text-view tags by input tags.
   *
   * @param item of the selected resource
   */
  startEdit(item: any): void {
    Object.assign(this.editCache[item.id], item);
    this.editCache[item.id].edit = true;
  }

  /**
   * Sets the editCache variable to false.
   * Else resets editCache to the previous value.
   *
   * @param item Resource selected
   */
  cancelEdit(item: any): void {
    this.editCache[item.id].edit = false;
  }

  /**
   * Creates or updates the resource passed.
   * Then updates the variables to avoid calling the backend again.
   *
   * @param item Resource selected
   */
   updateItem(item: any): void {
     new Area(item).update({name: item.name, code: item.code})
       .then((response: any) => {
         this.editCache[item.$id].edit = false;
         this.areas = this.areas.map(x => (x.id === item.id) ? response : x);
       })
      .catch( err => {
        console.error('ERROR: ', err);
      });
  }

  /**
   * Updates editCache variable with the same values of the resources array and adds a 'edit' key.
   */
  updateEditCache(): void {
    this.areas.forEach(item => {
      this.editCache[item.id] = {
        edit: this.editCache[item.id] ? this.editCache[item.id].edit : false,
        ...item
      };
    });
  }

  /**
   * Saves array of data in data base. The data can be provided from external file or from
   * multiple rows form.
   * @param items obtained from form array or array form.
   */
  saveArrayAreas(items: any[]): Promise<any> {
    const savePromises    = [];
    this.logPromisesERROR = [];
    this.logPromisesOK    = [];

    for (const item of items) {
      if (item.name && item.code) {
        item['ecoe'] = this.ecoeId;
        item.code = item.code.toString();

        const area = new Area(item);

        const promise = area.save()
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

  /**
   * Method for import areas values from file.
   * @param parserResult values that was readed from file.
   */
  importAreas(parserResult: Array<any>) {
    this.saveArrayAreas(parserResult)
      .catch( err => {
        console.error('save ERROR: ', err);
      })
      .finally(() => this.loadAreas());
  }

  /**
   * Resets the array of promise errors when tried to save on
   * data base.
   */
  clearImportErrors() {
    this.logPromisesERROR = [];
  }

  /**
   * Fired on page changed, will change the data to display.
   */
  pageChange() {
    this.loadAreas();
  }

  /**
   * When per page is changed this method will fired.
   * Will be reset the current page and loads again the areas
   * @param pageSize new value per page.
   */
  pageSizeChange(pageSize: number) {
    this.per_page = pageSize;
    this.resetCurrentPage();
    this.loadAreas();
  }

  /**
   * Resets current page to first (1)
   */
  resetCurrentPage() { this.current_page = 1; }

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
  addAreaRow() {
    this.control.push( this.fb.group(this.rowArea) );
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
  InitAreaRow() {
    if (this.control.length === 0) {
      this.addAreaRow();
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
    return this.areaForm.get('areaRow')['controls'][idx].controls[name];
  }

  /**
   * Before save values in data base, in first time checks that
   * all fields are validates and then will save the values.
   */
  submitForm(): void {
    for (const i in this.areaForm.get('areaRow')['controls']) {
      if (this.areaForm.get('areaRow')['controls'].hasOwnProperty(i)) {
        this.getFormControl('name', +i).markAsDirty();
        this.getFormControl('name', +i).updateValueAndValidity();

        this.getFormControl('code', +i).markAsDirty();
        this.getFormControl('code', +i).updateValueAndValidity();
      }
    }
    if (this.areaForm.valid) {
      this.saveArrayAreas(this.areaForm.get('areaRow').value)
        .finally(() => {
          this.loadAreas();
          this.closeDrawer();
          this.InitAreaRow();
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
    this.InitAreaRow();
  }

  onBack() {
    this.router.navigate(['/ecoe/' + this.ecoeId + '/admin']).finally();
  }
}
