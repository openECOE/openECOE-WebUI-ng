import { Component, OnInit, Input } from '@angular/core';
import {map} from 'rxjs/operators';
import {Location} from '@angular/common';
import { ECOE, Schedule } from 'src/app/models';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ChronoService } from 'src/app/services/chrono/chrono.service';

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
  stages: any;
  show_areas: Boolean = true;
  show_stations: Boolean;
  show_schedules: Boolean;
  show_students: Boolean;
  show_planner: Boolean;

  // Eliminar ECOE
  eliminando: Boolean = false;
  //--

  // Form ECOE name
  show_ecoe_name_drawer: Boolean = false;
  ecoe_name_form_loading: Boolean = false;
  ecoe_name_form: FormGroup;
  // --

  // Manage ECOE states
  changing_state: Boolean = false;
  // --


  constructor(
    private location: Location,
    private router: Router,
    private translate: TranslateService,
    private message: NzMessageService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private chronoService: ChronoService,
    private modalSrv: NzModalService) { }

  ngOnInit() {
    this.ecoe_name_form = this.fb.group({
      ecoe_name_2edit: ['', [Validators.required]]
    });

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

      this.ecoe_name_form.get('ecoe_name_2edit').setValue(this.ecoe.name);

      this.ecoe.areas().then(response => {
          this.areas = response;
          if (this.stations) {
            this.show_stations = (this.areas && this.areas.length > 0) || (this.stations && this.stations.length > 0);
          }
      });

      this.ecoe.stations().then(response => {
        this.stations = response;
        if (this.areas) {
          this.show_stations = (this.areas && this.areas.length > 0) || (this.stations && this.stations.length > 0);
        }
        if (this.stages) {
          this.show_schedules = (this.stations && this.stations.length > 0) || (this.stages && this.stages.length > 0);
        }
      });

      this.ecoe.rounds().then(response => {
        this.rounds = response;
        if (this.shifts && this.stages){
          this.show_planner = (this.stages && this.stages.length > 0) || (this.rounds && this.rounds.length > 0) || (this.shifts && this.shifts.length > 0);
        }
      });

      this.ecoe.shifts().then(response => {
        this.shifts = response;
        if (this.rounds && this.stages){
          this.show_planner = (this.stages && this.stages.length > 0) || (this.rounds && this.rounds.length > 0) || (this.shifts && this.shifts.length > 0);
        }
      });

      this.ecoe.students()
        .then(response => {
          this.students = response;
          if (this.stages){
            this.show_students = (this.stages && this.stages.length > 0) || (this.students && this.students.length > 0);
          }
        });

      this.ecoe.schedules().then((response:Schedule[]) => {
        this.stages = Array.from(new Set(response.map(m => m.stage)));
        if (this.students){
          this.show_students = (this.stages && this.stages.length > 0) || (this.students && this.students.length > 0);
        }
        if (this.rounds && this.shifts) {
          this.show_planner = (this.stages && this.stages.length > 0) || (this.rounds && this.rounds.length > 0) || (this.shifts && this.shifts.length > 0);
        }
        if (this.stations) {
          this.show_schedules = (this.stations && this.stations.length > 0) || (this.stages && this.stages.length > 0);
        }
      });

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
        this.router.navigate(['/']);
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
    this.ecoe_name_form.get('ecoe_name_2edit').setValue(this.ecoe.name);
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
        this.ecoeName = this.ecoe.name;
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

  onBack() {
    this.router.navigate(['/ecoe']).finally();
  }

  publishECOE() {
    this.changing_state = true;
    this.chronoService.publishECOE(this.ecoeId).toPromise()
      .then(result => this.reloadECOE())
      .catch(err => {
        console.warn(err);
        this.modalSrv.error({
          nzMask: false,
          nzTitle: this.translate.instant('ERROR_ACTION_STATE_PUBLISH')
        });  
      })
      .finally(() => {
        this.changing_state = false;
      });
  }

  draftECOE() {
    this.changing_state = true;
    this.chronoService.draftECOE(this.ecoeId).toPromise()
    .then(result => this.reloadECOE())
    .catch(err => {
      console.warn(err);
      this.modalSrv.error({
        nzMask: false,
        nzTitle: this.translate.instant('ERROR_ACTION_STATE_DRAFT')
      });  
    })
    .finally(()=>{
      this.changing_state = false;
    })
  }

  reloadECOE(){
    ECOE.fetch<ECOE>(this.ecoeId, {cache: false}).then(value => {
      this.ecoe = value;
    });
  }

}
