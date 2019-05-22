import { Component, OnInit } from '@angular/core';
import {ApiService} from '../../../../services/api/api.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ResourceIcons} from '../../../../constants/icons';
import {EcoeComponent} from '../ecoe.component';
import {ECOE} from '../../../../models/ecoe';

/**
 * Component with general information of the ECOE.
 */
@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.less']
})
export class InformationComponent implements OnInit {

  ecoe: any;
  icons: any = ResourceIcons;

  constructor(private apiService: ApiService,
              private route: ActivatedRoute,
              private router: Router,
              private ecoeComp: EcoeComponent) {
  }

  /**
   * Loads the ECOE data and parses the response as an array to use it on the nz-list component.
   */
  ngOnInit() {
    const ecoeId = +this.route.snapshot.params.id;
    // this.apiService.getResource(`/api/ecoe/${ecoeId}`).subscribe(ecoe => this.ecoe = [ecoe]);

    const excludeItems = ['areas', 'stations', 'schedules', 'students', 'rounds', 'shifts', 'organization'];

    ECOE.fetch(ecoeId, {cache: false, skip: excludeItems})
      .then(ecoe => {
        this.ecoe = [ecoe];
      });
  }

  /**
   * Calls ApiService to delete the actual ECOE.
   * Then navigates to /admin page.
   */
  deleteEcoe() {
    this.apiService.deleteResource(this.ecoe[0]['$uri']).subscribe(() => this.router.navigate(['/admin']));
  }
}
