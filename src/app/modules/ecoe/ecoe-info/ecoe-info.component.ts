import { Component, OnInit, Input } from '@angular/core';
import {Location} from '@angular/common';
import { ECOE } from 'src/app/models';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-ecoe-info',
  templateUrl: './ecoe-info.component.html',
  styleUrls: ['./ecoe-info.component.less']
})
export class EcoeInfoComponent implements OnInit {

  ecoeId: number;
  ecoeName: String ;
  ecoe: ECOE;

  areas: any;
  stations: any;
  students: any;
  rounds: any;
  shifts: any;
  schedules: any;

  // Eliminar ECOE
  eliminando: Boolean = false;
  //--

  // Form ECOE name
  show_ecoe_name_drawer: Boolean = false;
  ecoe_name_form_loading: Boolean = false;
  ecoe_name_form: FormGroup;
  cucu: FormGroup;
  // --


  constructor(
    private location: Location,
    private router: Router,
    private translate: TranslateService,
    private message: NzMessageService,
    private route: ActivatedRoute,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.ecoeId = params.ecoeId;
    });

    if (!this.ecoeId){
      console.log('Error EcoeInfoComponent: params required');
      this.location.back();
    }

    ECOE.fetch<ECOE>(this.ecoeId, {cache: false}).then(value => {
      this.ecoe = value;
      this.ecoeName = this.ecoe.name;

      this.ecoe_name_form = this.fb.group({
        ecoe_name_2edit: [this.ecoe.name, [Validators.required]]
      });

      this.ecoe.areas()
        .then(response => {
          this.areas = response;
        });

      this.ecoe.stations()
        .then(response => this.stations = response);

      this.ecoe.rounds()
        .then(response => this.rounds = response);

      this.ecoe.shifts()
        .then(response => this.shifts = response);

      this.ecoe.students()
        .then(response => this.students = response);

      this.ecoe.schedules()
        .then(response => this.schedules = response);
    });
  }

    /**
   * Calls ApiService to delete the actual ECOE.
   * Then navigates to /home page.
   */
  deleteEcoe() {
    this.eliminando = true;

    new ECOE(this.ecoe).destroy().then(
      result => {
        this.router.navigate(['/home']);
      }
    ).catch(
      error => {
        this.message.error(this.translate.instant('ERROR_REQUEST_CONTENT'), { nzDuration: 5000 });
      }
    ).finally(
      () => {
        this.eliminando = false;
      }
    )
  }

    /**
   * Show/Hide form to edit ECOE name
   *
   * @param show If true show drawer, if false hide drawer
   */
  showECOENameDrawer(show: Boolean) {
    this.show_ecoe_name_drawer = show;
  }

  /**
   * Submit edit ECOE name form
   */
  submitECOENameForm() {
    this.ecoe_name_form_loading = true;

    new ECOE(this.ecoe).update({name: this.ecoe_name_form.get('ecoe_name_2edit').value}).then(
      response => {
        this.message.success(this.translate.instant('OK_REQUEST_CONTENT'), { nzDuration: 5000 });
        this.ecoe = response;
      }
    ).catch(
      error => {
        this.message.error(this.translate.instant('ERROR_REQUEST_CONTENT'), { nzDuration: 5000 });
        this.ecoe_name_form.get('ecoe_name_2edit').setValue(this.ecoe.name);
      }
    ).finally(
      () => {
        this.ecoe_name_form_loading = false;
        this.showECOENameDrawer(false);
      }
    );
  }

}
