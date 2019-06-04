import {Component, OnInit} from '@angular/core';
import {ApiService} from '../../../../services/api/api.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ResourceIcons} from '../../../../constants/icons';
import {EcoeComponent} from '../ecoe.component';
import {Area, ECOE} from '../../../../models/ecoe';
import {Pagination} from '@openecoe/potion-client';

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

  constructor(private apiService: ApiService,
              private route: ActivatedRoute,
              private router: Router,
              private ecoeComp: EcoeComponent) {
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

    ECOE.fetch<ECOE>(ecoeId, {cache: false}).then(async value => {
      this.ecoe = value;
      console.log(this.ecoe);
      this.areas = await this.ecoe.areas({}, {paginate: true});
      this.stations = await this.ecoe.stations({}, {paginate: true});
      this.students = await this.ecoe.students({}, {paginate: true});
      this.rounds = await this.ecoe.rounds({}, {paginate: true});
      this.shifts = await this.ecoe.shifts({}, {paginate: true});

    });

    // this.areas = async () => await this.ecoe.areas({}, {paginate: true});
  }

  /**
   * Calls ApiService to delete the actual ECOE.
   * Then navigates to /admin page.
   */
  deleteEcoe() {
    this.apiService.deleteResource(this.ecoe[0]['$uri']).subscribe(() => this.router.navigate(['/admin']));
  }
}
