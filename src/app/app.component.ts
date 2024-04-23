import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { filter } from "rxjs/operators";
import { NavigationEnd, Router } from "@angular/router";
import { SharedService } from "./services/shared/shared.service";
import { AuthenticationService } from "./services/authentication/authentication.service";
import { UserService } from "./services/user/user.service";
import { OrganizationsService } from "./services/organizations-service/organizations.service";
import { Organization } from "./models";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.less"],
})
export class AppComponent implements OnInit { 

  language: string = "es";
  year: string = "";
  isCollapsed: Boolean = false;
  visible: Boolean = false;

  clientHeight: number;

  organizationList: Organization[];
  currentOrganization: Organization;

  @ViewChild("backTop", { static: true }) backTop: ElementRef;

  constructor(
    private translate: TranslateService,
    public router: Router,
    private sharedService: SharedService,
    public authService: AuthenticationService,
    public userService: UserService,
    public organizationsService: OrganizationsService
  ) {
    this.initializeTranslate();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.sharedService.setPageChanged(event.url);
      });

    // if (this.authService.userLogged) {
    //   this.authService.loadUserData();
    // }
  }

  /**
   * Initializes the browser language.
   */
  initializeTranslate() {
    this.translate.setDefaultLang(this.language);
    this.translate.use(this.translate.getBrowserLang() || this.language);
  }

  ngOnInit() {
    this.clientHeight = window.innerHeight;
    this.year = new Date().getFullYear().toString();

    this.userService.userDataChange.subscribe(
      (user) => {
        user.isSuper ? this.visible = true : this.visible = false;
      })

    this.organizationsService.getOrganizations().then(
      (organization) => {
        this.organizationList = organization;
        
      }
    )

    this.organizationsService.currentOrganizationChange.subscribe(
      (org) => {
        this.currentOrganization = org;
      }
    )
  }

  toCollapse(event) {
    this.isCollapsed = false;
  }

  isLoggedIn(): boolean {
    return this.authService.userLogged ? true : false;
  }

  userIsSuperAdmin(): Boolean {
    if(this.isLoggedIn()) {
      return this.visible;
    }
  }

  changeCurrentOrganization(selectedOrganization: Organization): void {
    this.organizationsService.currentOrganization = selectedOrganization;
  }
    
}
