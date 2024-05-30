import { Component, OnInit, OnDestroy } from '@angular/core';
import { Organization, User, UserLogged } from '@app/models';
import { UserService } from '@app/services/user/user.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit, OnDestroy {

  userData: UserLogged | null = null;
  usersPage: any[] = [];
  organizationsPage: any[] = [];
  loading: boolean = false;
  initialLoading: boolean = true;

  private userDataSubscription: Subscription;

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit() {
    this.userData = this.userService.userData;

    this.userDataSubscription = this.userService.userDataChange.subscribe(userData => {
      this.userData = userData;
      if (userData) {
        this.loadUsers();
        this.loadOrganizations();
      }
      this.initialLoading = false;
    });

    if (this.userData) {
      this.loadUsers();
      this.loadOrganizations();
      this.initialLoading = false;
    } else {
      this.userService.loadUserData().then(userData => {
        this.userService.userData = userData;
      });
    }

    this.router.navigate(['control-panel/personal-data']);
  }

  ngOnDestroy() {
    if (this.userDataSubscription) {
      this.userDataSubscription.unsubscribe();
    }
  }

  loadUsers() {
    if (this.userData) {
      this.loading = true;
      User.query({
        where: { organization: this.userData.user.organization }
      }, { paginate: true })
        .then((page) => this.usersPage = page)
        .finally(() => this.loading = false);
    }
  }

  loadOrganizations() {
    this.loading = true;
    Organization.query({}, { paginate: true })
      .then((page) => this.organizationsPage = page)
      .finally(() => this.loading = false);
  }

  goBack() {
    this.router.navigate(['/ecoe']);
  }
}
