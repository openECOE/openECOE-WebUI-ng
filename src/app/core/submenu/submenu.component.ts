import { Component, OnInit, Input } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Location } from "@angular/common";
import { NavigationEnd, NavigationCancel, Router } from "@angular/router";
import { filter } from "rxjs/operators";
import { UserService } from "@app/services/user/user.service";

@Component({
  selector: "app-submenu",
  templateUrl: "./submenu.component.html",
  styleUrls: ["./submenu.component.less"],
})
export class SubmenuComponent implements OnInit {
  @Input() submenuSelected: string;

  ecoeId: number;
  submenu2build = [];

  constructor(
    private translate: TranslateService,
    private router: Router,
    public location: Location,
    public userService: UserService
  ) {}

  ngOnInit() {
    this.router.events
      .pipe(filter((event) => {
        if(event instanceof NavigationEnd)
          return true; 
        if(event instanceof NavigationCancel)
          return true;
        return false;
        }))
      .subscribe(async () => {
        this.ecoeId = +this.router.url.split("/")[2];
        const activeLink = this.router.url.split("/")[3];
        await this.userService.loadUserData();
        const _userData = this.userService.userData;
        if (_userData) {
          const isEval = _userData.isEval;
          const isAdmin = _userData.isAdmin;

          const submenus = {
            ECOE: [
              {
                title: "CONFIGURATION",
                redirecTo: `/ecoe/${this.ecoeId}/admin`,
                active: activeLink === "admin",
                show: isAdmin,
              },
              {
                title: "EVALUATION",
                redirecTo: `/ecoe/${this.ecoeId}/eval`,
                active: activeLink === "eval",
                show: isEval || isAdmin,
              },
              {
                title: "SCHEDULE",
                redirecTo: `/ecoe/${this.ecoeId}/chrono`,
                active: activeLink === "chrono",
                show: isAdmin,
              },
              {
                title: "RESULTS",
                redirecTo: `/ecoe/${this.ecoeId}/results`,
                active: activeLink === "results",
                show: isAdmin,
              },
            ],
          };

          submenus.ECOE = submenus.ECOE.filter((s) => s.show);

          this.submenu2build = submenus[this.submenuSelected];
        }
      });
  }
}
