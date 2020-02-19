import { Component, OnInit, Input } from '@angular/core';
import {Location} from '@angular/common';
import { ECOE } from 'src/app/models';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-ecoe-info',
  templateUrl: './ecoe-info.component.html',
  styleUrls: ['./ecoe-info.component.less']
})
export class EcoeInfoComponent implements OnInit {

  @Input() ecoeId: number;

  ecoe: ECOE;

  areas: any;
  stations: any;
  students: any;
  rounds: any;
  shifts: any;

  // Eliminar ECOE
  eliminando: Boolean = false;
  //--

  constructor(private location: Location, private router: Router, private translate: TranslateService, private message: NzMessageService) { }

  ngOnInit() {
    if (!this.ecoeId){
      console.log('Error EcoeInfoComponent: @Input() required');
      this.location.back();
    }

    ECOE.fetch<ECOE>(this.ecoeId, {cache: false}).then(value => {
      this.ecoe = value;

      // this.ecoe_name_form = this.fb.group({
      //   ecoe_name_2edit: [this.ecoe.name, [Validators.required]]
      // });

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

}
