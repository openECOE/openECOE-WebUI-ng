import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiService} from '@services/api/api.service';
import {SharedService} from '@services/shared/shared.service';
import {Area, EditCache, RowArea, ECOE} from '../../../models';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import { ParserFile } from '@app/components/upload-and-parse/upload-and-parse.component';
import { NzMessageService } from 'ng-zorro-antd/message';

/**
 * Component with areas and number of questions by area.
 */
@Component({
  selector: 'app-areas',
  templateUrl: './areas.component.html',
  styleUrls: ['./areas.component.less']
})
export class AreasComponent implements OnInit {
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
    code: ['', Validators.required],
    weith: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    locked: [false]
  };

  data: object = {
    areaRow: [this.rowArea]
  };

  areaForm:   FormGroup;
  control:  FormArray;

  logPromisesERROR: { value: any, reason: any }[] = [];
  logPromisesOK:    any[] = [];

  areasParser: ParserFile = {
    "filename": "areas.csv",
    "fields": ["name", "code", "weith"],
    "data": [
      ["Anamnesis", "1", ""],
      ["Exploración física", "2", ""],
      ["Habilidades técnicas y procedimientos", "3", ""],
      ["Habilidades de comunicación", "4", ""],
      ["Juicio clínico y plan de manejo diagnóstico y terapéutico", "5", ""],
      ["Prevención y promoción de la salud", "6", ""],
      ["Relaciones interprofesionales , Aspectos éticos-legales y profesionalismo", "7", ""],
      ["Otros","9", ""]
    ]
  };

  constructor(private apiService: ApiService,
              private route: ActivatedRoute,
              private router: Router,
              private sharedService: SharedService,
              private fb: FormBuilder,
              private message: NzMessageService ) {

    this.areaForm = this.fb.group({
      //areaRow: this.fb.array([])
      areaRow: this.fb.array([], [this.validateTotalWeith.bind(this)]) // SCT validate weith
    });

    this.control = <FormArray>this.areaForm.controls.areaRow;

  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.ecoeId = +params.ecoeId;
      ECOE.fetch<ECOE>(this.ecoeId, {cache: false}).then(value => {
        this.ecoe = value;
        this.ecoe_name = this.ecoe.name;
        this.areasParser.filename = this.ecoe_name + '_' + this.areasParser.filename;

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
  /** SCT Validador global: suma de los WEITH debe ser 100 */
    // SCT valida pesos
  validateTotalWeith(control: AbstractControl): any {
    const rows = (control as FormArray).controls;

    const total = rows.reduce((acc, row) => {
      const val = Number(row.get('weith')?.value);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);

    return total === 100 ? null : { totalWeithNot100: total };
  }
  getTotalWeith(): number {
    // When the form includes existing areas (rows with an `id`), we must
    // avoid double-counting them. Build the total as:
    // - sum of all form rows' weights
    // - plus weights of existing areas not present in the form

    // Sum weights from form rows
    const formTotal = this.control.controls.reduce((acc, row) => {
      const val = Number(row.get('weith')?.value);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);

    // Collect ids present in the form (for rows that map to existing areas)
    const idsInForm = new Set<number>();
    this.control.controls.forEach(row => {
      const id = row.get('id')?.value;
      if (id !== undefined && id !== null && id !== '') {
        idsInForm.add(Number(id));
      }
    });

    // Sum weights of existing areas that are NOT represented in the form
    const remainingExisting = this.areas.reduce((acc, area) => {
      if (idsInForm.has(Number(area.id))) { return acc; }
      return acc + Number(area.weith || 0);
    }, 0);

    return remainingExisting + formTotal;
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
   * Creates or updates the resource passed. Actualiza Areas
   * Then updates the variables to avoid calling the backend again.
   *
   * @param item Resource selected
   */
   updateItem(item: any): void {
    
    new Area(item).update({name: item.name, code: item.code, weith: Number(item.weith)})
    //new Area(item).update({name: item.name, code: item.code})
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
        if (item.id) {
          // existing area -> fetch instance then update (avoid assigning id to prototype)
          const promise = Area.fetch(item.id, {cache: false})
            .then((areaInstance: any) => areaInstance.update({name: item.name, code: item.code.toString(), weith: Number(item.weith || 0)}))
            .then(result => {
              this.logPromisesOK.push(result);
              return result;
            })
            .catch(err => {
              this.logPromisesERROR.push({ value: item, reason: err });
              return err;
            });
          savePromises.push(promise);
        } else {
          // new area -> create
          const area = new Area();
          area.ecoe = this.ecoe;
          area.name = item.name;
          area.code = item.code.toString();
          area.weith = Number(item.weith || 0);

          const promise = area.save()
            .then(result => {
              this.logPromisesOK.push(result);
              return result;
            })
            .catch(err => {
              this.logPromisesERROR.push({ value: item, reason: err });
              return err;
            });
          savePromises.push(promise);
        }
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
   * Convertimos los CSV fields a objetos con name, code, weith
   */
/*   importAreas(parserResult: Array<any>) {
    this.saveArrayAreas(parserResult)
      .catch( err => {
        console.error('save ERROR: ', err);
      })
      .finally(() => this.loadAreas());
  } */
  importAreas(parserResult: Array<any>) {
  // Convertimos CSV/JSON fields a objetos {name, code, weith}
  const formatted = parserResult.map(item => ({
    name: item[' '] || item.name,
    code: item.code.toString(),
    weith: Number(item.weith) || 0
  }));

  // Verificamos total WEITH incluyendo áreas existentes
  const formTotal = formatted.reduce((acc, item) => acc + item.weith, 0);
  const totalWeith = this.areas.reduce((acc, area) => acc + (area.weith || 0), 0) + formTotal;

  if (totalWeith > 100) {
    this.message.error(`La suma total de WEITH no puede superar 100. Actualmente: ${totalWeith}`);
    return;
  }

  // Guardar áreas importadas
  this.saveArrayAreas(formatted)
    .catch(err => console.error('Error importando áreas:', err))
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
    // Populate form with current areas so user can edit weights together with new ones
    // Clear existing form rows
    while (this.control.length > 0) { this.control.removeAt(0); }

    // Add existing areas as editable rows
    this.areas.forEach(area => {
      this.control.push(this.fb.group({
        id: [area.id],
        name: [area.name, Validators.required],
        code: [area.code, Validators.required],
        weith: [area.weith || 0, [Validators.required, Validators.min(0), Validators.max(100)]],
        locked: [false]
      }));
    });

    // Always include one empty row to allow adding a new area
    this.control.push( this.fb.group(this.rowArea) );
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
   * Auto balance weights across all rows in the form so total equals 100.
   * This distributes integer percentages evenly and assigns the remainder
   * to the first rows.
   */
  autobalanceWeights() {
    const controls = this.control.controls;
    const unlocked = [];
    let lockedSum = 0;

    controls.forEach(c => {
      const isLocked = !!c.get('locked')?.value;
      const val = Number(c.get('weith')?.value) || 0;
      if (isLocked) {
        lockedSum += val;
      } else {
        unlocked.push(c);
      }
    });

    const remaining = 100 - lockedSum;
    if (remaining < 0) {
      this.message.error(`La suma de los pesos bloqueados supera 100 (bloqueado: ${lockedSum}).`);
      return;
    }

    const m = unlocked.length;
    if (m === 0) {
      this.message.info('No hay filas desbloqueadas para autobalancear.');
      return;
    }

    const base = Math.floor(remaining / m);
    let remainder = remaining - base * m;

    for (let i = 0; i < m; i++) {
      const value = base + (remainder > 0 ? 1 : 0);
      remainder = Math.max(0, remainder - 1);
      const control = unlocked[i].get('weith');
      if (control) {
        control.setValue(value);
        control.markAsDirty();
        control.updateValueAndValidity();
      }
    }

    // Update validators
    this.areaForm.get('areaRow').updateValueAndValidity();
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
  /* submitForm(): void {
    for (const i in this.areaForm.get('areaRow')['controls']) {
      if (this.areaForm.get('areaRow')['controls'].hasOwnProperty(i)) {
        this.getFormControl('name', +i).markAsDirty();
        this.getFormControl('name', +i).updateValueAndValidity();

        this.getFormControl('code', +i).markAsDirty();
        this.getFormControl('code', +i).updateValueAndValidity();

        this.getFormControl('weith', +i).markAsDirty();
        this.getFormControl('weith', +i).updateValueAndValidity();
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
    // SCT Validación total de WEITH incluyendo áreas existentes
    const total = this.getTotalWeith();
    if (total > 100) {
      this.message.error(`La suma de los pesos no puede superar 100. Actualmente: ${total}`);
      return;
    }
    
  } */

  /**
   * When user decides do not save the form values and
   * close the form window: will close the drawer window
   * and reset the number of row areas.
   */
  submitForm(): void {
  // Marcar todos los campos como sucios y validar
  // Build raw values and filter out empty rows so the required validators
  // on empty placeholder rows don't block saving existing/edited rows.
  const allRows = this.control.value as any[];

  // Consider a row as 'present' if it has an id (existing), or a name/code, or a non-zero weight
  const rowsToSave = allRows.filter(r => {
    const hasName = r.name !== undefined && r.name !== null && String(r.name).trim() !== '';
    const hasCode = r.code !== undefined && r.code !== null && String(r.code).trim() !== '';
    const hasWeight = Number(r.weith) && Number(r.weith) !== 0;
    const hasId = r.id !== undefined && r.id !== null && r.id !== '';
    return hasId || hasName || hasCode || hasWeight;
  });

  if (rowsToSave.length === 0) {
    this.message.info('No hay filas a guardar.');
    return;
  }

  // Mark only the rows that will be saved as dirty so their validators run
  allRows.forEach((row, i) => {
    const include = rowsToSave.indexOf(row) !== -1;
    if (include) {
      this.getFormControl('name', i).markAsDirty();
      this.getFormControl('name', i).updateValueAndValidity();

      this.getFormControl('code', i).markAsDirty();
      this.getFormControl('code', i).updateValueAndValidity();

      this.getFormControl('weith', i).markAsDirty();
      this.getFormControl('weith', i).updateValueAndValidity();
    }
  });

  // Validate total weight considering only rows to save + existing areas not in the form
  const totalWeith = this.getTotalWeithForRows(rowsToSave);
  if (totalWeith > 100) {
    this.message.error(`La suma de los pesos no puede superar 100. Actualmente: ${totalWeith}`);
    return;
  }

  // If any of the rows to save have invalid controls, show an error
  const anyInvalid = rowsToSave.some((r, idx) => {
    // find index in allRows to access controls
    const i = allRows.indexOf(r);
    return this.getFormControl('name', i).invalid || this.getFormControl('code', i).invalid || this.getFormControl('weith', i).invalid;
  });
  if (anyInvalid) {
    this.message.error('Hay campos inválidos. Revise los campos requeridos.');
    return;
  }

  // Proceed to save only the filtered rows
  this.saveArrayAreas(rowsToSave)
    .finally(() => {
      this.loadAreas();
      this.closeDrawer();
      this.InitAreaRow();
    });
}

  /**
   * Compute total weight for a set of form rows plus existing areas not represented in those rows.
   * This prevents double-counting when the form already contains existing areas.
   */
  getTotalWeithForRows(rows: any[]): number {
    // Sum weights from provided rows
    const formTotal = rows.reduce((acc, row) => acc + (Number(row.weith) || 0), 0);

    // Collect ids present in rows
    const idsInRows = new Set<number>();
    rows.forEach(r => { if (r.id !== undefined && r.id !== null && r.id !== '') idsInRows.add(Number(r.id)); });

    // Sum existing areas not in rows
    const remainingExisting = this.areas.reduce((acc, area) => {
      if (idsInRows.has(Number(area.id))) { return acc; }
      return acc + Number(area.weith || 0);
    }, 0);

    return remainingExisting + formTotal;
  }

  cancelForm() {
    this.closeDrawer();
    this.InitAreaRow();
  }

  onBack() {
    this.router.navigate(['/ecoe/' + this.ecoeId + '/admin']).finally();
  }


}
