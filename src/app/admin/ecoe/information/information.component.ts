import { Component, OnInit } from '@angular/core';
import {ApiService} from '../../../services/api/api.service';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.less']
})
export class InformationComponent implements OnInit {

  ecoe: any;

  constructor(private apiService: ApiService,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    const ecoeId = +this.route.snapshot.params.id;
    this.apiService.getResource(`/api/ecoe/${ecoeId}`).subscribe(ecoe => this.ecoe = [ecoe]);
  }

  deleteEcoe() {
    this.apiService.deleteResource(this.ecoe['$uri']).subscribe(() => this.router.navigate(['/admin']));
  }
}
