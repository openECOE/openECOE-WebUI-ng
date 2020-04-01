import {Component, OnInit, Input} from '@angular/core';
import {map} from 'rxjs/operators';
import {Location} from '@angular/common';
import {Area, ECOE, Round, Schedule, Shift} from '@models/index';
import {Router, ActivatedRoute} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {NzMessageService, NzModalService} from 'ng-zorro-antd';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {ChronoService} from '@services/chrono/chrono.service';
import {Pagination} from '@openecoe/potion-client';

interface ISummaryItems {
  total: number;
  show: Boolean;
  loading?: Boolean;
}

@Component({
  selector: 'app-ecoe-info',
  templateUrl: './ecoe-info.component.html',
  styleUrls: ['./ecoe-info.component.less']
})
export class EcoeInfoComponent implements OnInit {

  ecoeId: number;
  ecoeName: String;
  ecoe: ECOE;

  areas: ISummaryItems = {total: 0, show: true, loading: true};
  stations: ISummaryItems = {total: 0, show: false, loading: true};
  students: ISummaryItems = {total: 0, show: false, loading: true};
  stages: ISummaryItems = {total: 0, show: false, loading: true};
  rounds: ISummaryItems = {total: 0, show: false, loading: true};
  shifts: ISummaryItems = {total: 0, show: false, loading: true};

  show_areas: Boolean = true;
  show_stations: Boolean;
  show_schedules: Boolean;
  show_students: Boolean;
  show_planner: Boolean;

  // Eliminar ECOE
  eliminando: Boolean = false;
  // --

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
    private modalSrv: NzModalService) {
  }

  ngOnInit() {
    this.ecoe_name_form = this.fb.group({
      ecoe_name_2edit: ['', [Validators.required]]
    });

    this.route.params.subscribe(params => {
      this.ecoeId = params.ecoeId;
    });

    if (!this.ecoeId) {
      console.log('Error EcoeInfoComponent: params required');
      this.location.back();
    }

    ECOE.fetch<ECOE>(this.ecoeId, {cache: false}).then(value => {
      this.ecoe = value;
      this.ecoeName = this.ecoe.name;

      this.ecoe_name_form.get('ecoe_name_2edit').setValue(this.ecoe.name);

      this.ecoe.areas({perPage: 1}, {paginate: true}).then(response => {
        this.areas.total = response.total;
        this.areas.loading = false;

        this.stations.show = this.areas.total > 0 || this.stations.total > 0;
      });

      this.ecoe.stations({perPage: 1}, {paginate: true}).then(response => {
        this.stations.total = response.total;
        this.stations.loading = false;
        this.stations.show = this.areas.total > 0 || this.stations.total > 0;

        this.stages.show = this.stations.total > 0 || this.stages.total > 0;
      });

      this.ecoe.stages({perPage: 1}, {paginate: true}).then(response => {
        this.stages.total = response.total;
        this.stages.loading = false;
        this.stages.show = this.stations.total > 0 || this.stages.total > 0;

        this.students.show = this.stages.total > 0 || this.students.total > 0;

        this.rounds.show = this.stages.total > 0 || this.rounds.total > 0;
        this.shifts.show = this.stages.total > 0 || this.shifts.total > 0;

      });

      this.ecoe.students({perPage: 1}, {paginate: true}).then(response => {
        this.students.total = response.total;
        this.students.loading = false;
        this.students.show = this.stages.total > 0 || this.students.total > 0;
      });

      this.ecoe.rounds({perPage: 1}, {paginate: true}).then((response: Pagination<Round>) => {
        this.rounds.total = response.total;
        this.rounds.loading = false;
        this.rounds.show = this.stages.total > 0 || this.rounds.total > 0;
      });

      this.ecoe.shifts({perPage: 1}, {paginate: true}).then((response: Pagination<Shift>) => {
        this.shifts.total = response.total;
        this.shifts.loading = false;
        this.shifts.show = this.stages.total > 0 || this.shifts.total > 0;
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
        this.message.error(this.translate.instant('ERROR_REQUEST_CONTENT'), {nzDuration: 5000});
      }
    ).finally(
      () => {
        this.eliminando = false;
      }
    );
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
        this.message.success(this.translate.instant('OK_REQUEST_CONTENT'), {nzDuration: 5000});
        this.ecoe = response;
        this.ecoeName = this.ecoe.name;
      }
    ).catch(
      error => {
        this.message.error(this.translate.instant('ERROR_REQUEST_CONTENT'), {nzDuration: 5000});
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
      .finally(() => {
        this.changing_state = false;
      });
  }

  reloadECOE() {
    ECOE.fetch<ECOE>(this.ecoeId, {cache: false}).then(value => {
      this.ecoe = value;
    });
  }

}
