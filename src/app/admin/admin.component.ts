import { Component, OnInit } from '@angular/core';
import {ApiService} from '../services/api/api.service';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs/operators';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.less']
})
export class AdminComponent implements OnInit {

  isCollapsed: boolean = false;
  ecoes: any[];
  ecoeForm: FormControl;
  showCreateEcoe: boolean;

  constructor(private apiService: ApiService,
              private formBuilder: FormBuilder,
              private router: Router) { }

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => this.isCollapsed = !(event.url === '/admin'));

    this.ecoeForm = this.formBuilder.control('', Validators.required);

    this.loadEcoes();
  }

  loadEcoes() {
    this.apiService.getResources('ecoe').subscribe(ecoes => this.ecoes = ecoes);
  }

  submitForm() {
    const body = {
      name: this.ecoeForm.value,
      organization: 1 // TODO: usar la organizacion del usuario
    };

    this.apiService.createResource('ecoe', body)
      .subscribe(result => {
        if (result) {
          this.loadEcoes();
          this.closeDrawer();
        }
      });
  }

  closeDrawer() {
    this.showCreateEcoe = false;
    this.ecoeForm.reset();
  }
}
