import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Organization } from '@app/models';
import { UserService } from '@app/services/user/user.service';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-change-organization',
  templateUrl: './change-organization.component.html',
  styleUrls: ['./change-organization.component.less']
})
export class ChangeOrganizationComponent implements OnInit, OnDestroy {
  currentOrganization: Organization;
  organizations: Organization[];
  isSuperAdmin: boolean = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private translate: TranslateService
  ) { }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  ngOnInit(): void {
    this.getOrganizations();

    this.userService.userDataChange
      .pipe(takeUntil(this.destroyed$))
      .subscribe((user) => {
        if(user) {
          this.isSuperAdmin = user.isSuper;
          this.currentOrganization = user.user.organization;
          // 🌐 Sincronizar idioma con el servicio de traducción
          if (user.user.language) {
            this.translate.use(user.user.language);
          }
        }
    });
  }

  async getOrganizations(): Promise<void> {
    this.organizations = await Organization.query();
  }

  async changeCurrentOrganization(selectedOrganization: Organization): Promise<void> {
    const data = {
      organization: selectedOrganization
    }

    try {
      await this.userService.userData.user.update(data); 
    } catch (err) {
      console.log("Error while changing organization: " + err);
    }

    //this.currentOrganization = this.userService.userData.user.organization;
    await this.userService.loadUserData();
    await this.router.navigate(['/ecoe']);
    window.location.reload();
  }
  
 

  async changeLanguage(selectedLanguage: string): Promise<void> {    
    try {
      const data = { language: selectedLanguage };
      
      // 1. Actualizamos en base de datos
      await this.userService.userData.user.update(data); 
      
      // 2. Forzamos la recarga de los datos del usuario en el servicio
      await this.userService.loadUserData();
      
    // 3. Cambiar idioma en el servicio de traducción inmediatamente
      this.translate.use(selectedLanguage).subscribe(() => {
          // 4. Solo recargamos cuando el archivo de idioma se ha cargado con éxito
          window.location.reload();
      });
    } catch (err) {
      console.error("Error al cambiar el idioma:", err);
    }
  }
}
