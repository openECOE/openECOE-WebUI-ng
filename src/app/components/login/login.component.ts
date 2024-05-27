import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthenticationService} from '../../services/authentication/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {

  validateForm: FormGroup;
  returnUrl: string;
  error_login: Boolean = false;
  passwordVisible: Boolean = false;

  constructor(private formBuilder: FormBuilder,
              private authService: AuthenticationService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    this.validateForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  submitForm(): void {
    this.error_login = false;
    this.validateForm.get('email').setValue(this.validateForm.value.email.trim())
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }

    if (this.validateForm.valid) {
      this.authService.loginUser(this.validateForm.value)
        .subscribe(
          result => {
            if (result) {
              this.router.navigate([this.returnUrl]);
            } else {
              this.error_login = true;
            }
          },
          error => {
            this.error_login = true;
          });
    }
  }

}
