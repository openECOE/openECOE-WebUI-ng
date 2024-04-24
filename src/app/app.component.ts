import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { filter } from "rxjs/operators";
import { NavigationEnd, Router } from "@angular/router";
import { SharedService } from "./services/shared/shared.service";
import { AuthenticationService } from "./services/authentication/authentication.service";
import { UserService } from "./services/user/user.service";
import { OrganizationsService } from "./services/organizations-service/organizations.service";
import { Organization } from "./models";
import { ServerStatusService } from "./services/server-status/server-status.service";
import { ActionMessagesService } from "./services/action-messages/action-messages.service";
import {NzMessageRef } from 'ng-zorro-antd';

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.less"],
})
export class AppComponent implements OnInit { 

  language: string = "es";
  year: string = "";
  isCollapsed: Boolean = false;
  visible: boolean = false;

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
    private serverStatusService: ServerStatusService,
    private actionMessageService: ActionMessagesService,
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
    
    this.userService.userDataChange
      .subscribe(user => this.visible = user?.isSuper || false)
    this.checkServerStatus();
  }

  toCollapse(event) {
    this.isCollapsed = false;
  }

  isLoggedIn(): boolean {
    return this.authService.userLogged ? true : false;
  }

  userIsSuperAdmin(): boolean {
    return this.isLoggedIn() ? this.visible : false;
  }    

  checkServerStatus(): void {
    let previousStatus = true;
    let errorMessageRef: NzMessageRef;

    this.serverStatusService.isAvailable
    .subscribe( (status: boolean) => {
        if(!status && previousStatus) {
          errorMessageRef = this.actionMessageService.createErrorMsg(this.translate.instant("LOST_BACKEND_CONNECTION"), { nzDuration: 0});
        }
        
        if(status && !previousStatus) {
          this.actionMessageService.removeMessage(errorMessageRef.messageId);
          this.actionMessageService.createSuccessMsg(this.translate.instant("RECOVERED_BACKEND_CONNECTION"));
        }

        previousStatus = status;

      }
    );
  }
}
