import { Component, ElementRef, NgZone, OnInit, ViewChild } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { filter } from "rxjs/operators";
import { NavigationEnd, Router } from "@angular/router";
import { SharedService } from "./services/shared/shared.service";
import { AuthenticationService } from "./services/authentication/authentication.service";
import { UserService } from "./services/user/user.service";
import { Organization } from "./models";
import { ServerStatusService } from "./services/server-status/server-status.service";
import { ActionMessagesService } from "./services/action-messages/action-messages.service";
import { NzMessageRef } from "ng-zorro-antd/message";
import { GlobalErrorHandlerService } from "./services/error-handler.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.less"],
})
export class AppComponent implements OnInit {

  language: string = "es";
  year: string = "";
  isCollapsed: Boolean = false;

  clientHeight: number;

  organizationName: string;

  @ViewChild("backTop", { static: true }) backTop: ElementRef;

  constructor(
    private translate: TranslateService,
    public router: Router,
    private sharedService: SharedService,
    public authService: AuthenticationService,
    public userService: UserService,
    private serverStatusService: ServerStatusService,
    private actionMessageService: ActionMessagesService,
    private errorHandlerSvc: GlobalErrorHandlerService,
    private ngZone: NgZone
  ) {
    this.initializeTranslate();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.sharedService.setPageChanged(event.url);
      });
  }

  /**
   * Initializes the browser language.
   */
  initializeTranslate() {
    this.translate.setDefaultLang(this.language);
    let browserLanguage = this.translate.getBrowserLang();
    let isBrowserLangAvailable = this.translate.getLangs().includes(browserLanguage);
    this.translate.use(isBrowserLangAvailable ? browserLanguage  : this.language);
  }

  ngOnInit() {
    this.clientHeight = window.innerHeight;
    this.year = new Date().getFullYear().toString();
    this.checkServerStatus();
    this.handleErrors();
  }

  handleErrors() {
    // Captura errores en promesas no manejadas
    window.addEventListener("unhandledrejection", (event) => {
      const error = event.reason || new Error("Error en promesa no manejada");
      this.ngZone.run(() => this.errorHandlerSvc.handleError(error));
    });

    // Captura errores no manejados en eventos globales
    window.addEventListener("error", (event) => {
      const error = event.error || event.message || new Error("Error en evento global");
      this.ngZone.run(() =>this.errorHandlerSvc.handleError(error));
    });
  }

  toCollapse(event) {
    this.isCollapsed = false;
  }

  isLoggedIn(): boolean {
    return this.authService.userLogged ? true : false;
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
