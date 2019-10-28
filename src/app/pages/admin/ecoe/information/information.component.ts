import {Component, OnInit} from '@angular/core';
import {ApiService} from '../../../../services/api/api.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ResourceIcons} from '../../../../constants/icons';
import {ECOE} from '../../../../models';

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
              private router: Router) {
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

  onBack() {
    this.router.navigate(['./home']).finally();
  }
}
