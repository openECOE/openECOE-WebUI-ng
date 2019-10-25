import { Component, OnInit } from '@angular/core';
import {mergeMap} from 'rxjs/operators';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {AuthenticationService} from '../../services/authentication/authentication.service';
import {ApiService} from '../../services/api/api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {

  showCreateEcoe: boolean;
  ecoes: any[];
  ecoeForm: FormControl;
  organization: any;
  isAdmin: boolean;

  constructor(private formBuilder: FormBuilder,
              private authService: AuthenticationService,
              private apiService: ApiService) { }

  ngOnInit() {
    this.ecoeForm = this.formBuilder.control('', Validators.required);
    if (this.authService.userLogged) {
      this.authService.loadUserData()
        .subscribe(() => {
          this.loadEcoes();
          this.isAdmin = (this.authService.userData['role'] === 'Admin');
        });
    } else {
      this.authService.logout();
    }
  }


  closeDrawer() {
    this.showCreateEcoe = false;
    this.ecoeForm.reset();
  }

  loadEcoes() {
    this.authService.getUserData().pipe(
      mergeMap(userData => {
        this.organization = userData.organization;
        return this.apiService.getResources('ecoes', {
          where: `{"organization":{"$eq":${JSON.stringify(this.organization)}}}`
        });
      })
    ).subscribe(ecoes => {
      this.ecoes = ecoes;
      this.ecoes.unshift([undefined]);
      console.log('ecoes: ' , this.ecoes);
    });
  }

  submitForm() {
    const body = {
      name: this.ecoeForm.value,
      organization: this.organization
    };

    this.apiService.createResource('ecoes', body)
      .subscribe(result => {
        if (result) {
          this.loadEcoes();
          this.closeDrawer();
        }
      });
  }
}
