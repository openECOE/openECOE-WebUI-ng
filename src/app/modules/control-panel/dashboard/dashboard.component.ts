import { Component, OnInit, OnDestroy } from '@angular/core';
import { Organization, User, UserLogged } from '@app/models';
import { UserService } from '@app/services/user/user.service';
import { Router } from '@angular/router';
import { ReplaySubject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Item, Pagination } from '@openecoe/potion-client';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit, OnDestroy {

  userData: UserLogged;
  usersPage: Pagination<User> | null;
  organizationsPage: Pagination<Organization> | null;
  loading: boolean = false;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loading = true;
    if (this.userService.userData) {
      this.loadUserData(this.userService.userData);
    } else {
      this.userService.userDataChange
        .pipe(takeUntil(this.destroyed$))
        .subscribe((userData: UserLogged) => {
          this.loadUserData(userData)
        });
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  loadUserData(userData: UserLogged): void {
    this.userData = userData;
    this.loadData().then(() => {
      this.loading = false
    });
  }

  async loadData(): Promise<void> {
    if (this.userData.isAdmin) {
      this.usersPage = await this.loadUsers();
    }
    
    if (this.userData.isSuper) {
      this.organizationsPage = await this.loadOrganizations();
    }
  }

  loadUsers(): Promise<Pagination<User>> {
    return User.query<User, Pagination<User>>(
      { where: { organization: this.userData.user.organization } },
      { paginate: true });
  }

  loadOrganizations(): Promise<Pagination<Organization>> {
    return Organization.query<Organization, Pagination<Organization>>({}, { paginate: true });
  }

  goBack(): void {
    this.router.navigate(['/ecoe']);
  }

  navigate(route: string): void {
    this.router.navigate(['/']);
  }
}
