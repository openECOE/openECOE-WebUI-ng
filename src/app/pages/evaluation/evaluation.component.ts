import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from '../../services/authentication/authentication.service';
import {ECOE} from '../../models';
import {Location} from '@angular/common';

@Component({
  selector: 'app-evaluation',
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.less']
})
export class EvaluationComponent implements OnInit {
  private ecoes: ECOE[] = [];

  constructor(private authService: AuthenticationService,
              private location: Location) { }

  ngOnInit() {
    this.loadEcoes();
  }

  loadEcoes() {
    this.authService.getUserData()
    .subscribe(() => {
      ECOE.query()
        .then( (ecoes: ECOE[]) => {
          this.ecoes = ecoes;
          console.log(ecoes);
        });
    });
  }


  onBack() {
    this.location.back();
  }
}
