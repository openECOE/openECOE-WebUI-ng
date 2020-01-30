import {Component, OnInit} from '@angular/core';
import {ApiService} from '../../../../services/api/api.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ResourceIcons} from '../../../../constants/icons';
import {ECOE} from '../../../../models';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd';

/**
 * Component with general information of the ECOE.
 */
@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.less']
})
export class InformationComponent implements OnInit {

  ecoe: ECOE;
  icons: any = ResourceIcons;

  // Form ECOE name
  show_ecoe_name_drawer: Boolean = false;
  ecoe_name_form_loading: Boolean = false;
  ecoe_name_form: FormGroup;
  // --

  constructor(private apiService: ApiService,
              private route: ActivatedRoute,
              private router: Router,
              private fb: FormBuilder,
              private message: NzMessageService,
              private translate: TranslateService) {
  }

  areas: any;
  stations: any;
  students: any;
  rounds: any;
  shifts: any;

  /**
   * Loads the ECOE data and parses the response as an array to use it on the nz-list component.
   */
  ngOnInit() {
    const ecoeId = +this.route.snapshot.params.id;

    ECOE.fetch<ECOE>(ecoeId, {cache: false}).then(value => {
      this.ecoe = value;

      this.ecoe_name_form = this.fb.group({
        ecoe_name_2edit: [this.ecoe.name, [Validators.required]]
      });

      this.ecoe.areas({perPage: 1}, {paginate: true})
        .then(response => this.areas = response);

      this.ecoe.stations({perPage: 1}, {paginate: true})
        .then(response => this.stations = response);

      this.ecoe.rounds({perPage: 1}, {paginate: true})
        .then(response => this.rounds = response);

      this.ecoe.shifts({perPage: 1}, {paginate: true})
        .then(response => this.shifts = response);

      // this.ecoe.students({perPage: 1}, {paginate: true})
      //   .then(response => this.students = response);
    });
  }

  /**
   * Calls ApiService to delete the actual ECOE.
   * Then navigates to /admin page.
   */
  deleteEcoe() {
    this.apiService.deleteResource(this.ecoe[0]['$uri']).subscribe(() => this.router.navigate(['/admin']));
  }

  /**
   * Backs to home page
   */
  onBack() {
    this.router.navigate(['./home']).finally();
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
