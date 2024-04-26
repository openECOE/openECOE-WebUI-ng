import { Component, EventEmitter, Input, NgZone, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ParserFile } from '@app/components/upload-and-parse/upload-and-parse.component';
import { Organization } from '@app/models';
import { ApiService } from '@app/services/api/api.service';
import { OrganizationsService } from '@app/services/organizations-service/organizations.service';
import { SharedService } from '@app/services/shared/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';


@Component({
  selector: 'app-organizations-list',
  templateUrl: './organizations-list.component.html',
  styleUrls: ['./organizations-list.component.less']
})
export class OrganizationsListComponent implements OnInit {
  organization: Organization;

  @Input() showDeleteButton: boolean = true;
  @Output() delete: EventEmitter<void> = new EventEmitter<void>();

  organizations: Array<Organization> = [];
  organizationsPage: any;
  editCache: CacheItem[] = [];

  page: number = 1;
  perPage: number = 20;
  totalItems: number = 0;
  loading: boolean = false;

  // FORMULARIO EDITAR
  organizationEditar: Organization;
  organizationOriginal: Organization;

  validateForm: FormGroup;
  showAddOrganization: boolean = false;
  showMessageDelete: boolean = false;
  showEditOrganization: boolean = false;
  importErrors: { value: any; reason: any }[] = [];

  idx: any;
  item: any;

  organizationParser: ParserFile = {
    "filename": "organizations.csv",
    "fields": ["orgName"], 
    "data": ["name"]
  };
  constructor(
    private organizationsService: OrganizationsService,
    private apiService: ApiService,
    public shared: SharedService,
    private fb: FormBuilder,
    public formBuilder: FormBuilder,
    private message: NzMessageService,
    private zone: NgZone,
    private router: Router,
    private translate: TranslateService,
    private modalService: NzModalService
  ) { }

  ngOnInit(): void {
    this.getOrganizationForm();

    this.loadOrganizations();

    this.loading = false;
  }

  async getOrganizationForm() {
    this.validateForm = this.fb.group({
      name: [null,[Validators.required]],
    });
  }

  loadOrganizations() {
    this.loading = true;
    this.organizationsService
      .getOrganizationsPage({
        page: this.page,
        perPage: this.perPage,
      })
      .then((organizations) => {
        this.loadPage(organizations);
      })
      .catch((err) => console.log(err))
      .finally(() => (this.loading = false));
  }

  pageChange(page: number) {
    this.loading = true;
    this.page = page;
    this.organizationsPage
      .changePageTo(page)
      .then((retPage) => this.loadPage(retPage))
      .finally(() => (this.loading = false));
  }

  pageSizeChange(pageSize: number) {
    this.perPage = pageSize;
    this.loadOrganizations();
  }

  async loadPage(page: any) {
    this.organizationsPage = page;
    this.totalItems = this.organizationsPage.total;
    const _organizations: Array<Organization> = [...this.organizationsPage.items];
    
    this.updateEditCache(page.items, this.editCache);
    this.organizations = _organizations;
  }

  assignEditCache(
    item: CacheItem,
    editItem: boolean = false,
    newItem: boolean = false
  ) {
    return {
      editItem: editItem,
      newItem: newItem,
      data: item,
    };
  }

  updateEditCache(listItems: any[], editCache: any[]) {
    editCache = [];
    listItems.forEach((item, index) => {
      editCache[index] = this.assignEditCache(
        item,
        editCache[index] ? editCache[index].editItem : false,
        false
      );
    });
    this.editCache = Object.create(editCache);
  }

  async addOrganization(
    name: string = "",
    batch: boolean = false
  ): Promise<Organization> {
    try {
        const newOrganization = new Organization({
            name: name
        });

        const _organization = await newOrganization.save();

        if (!batch) {
          this.message.success(
            this.translate.instant("ORGANIZATION_CREATED", { name: _organization.name})
          );
        }

        return _organization;
    } catch (error) {
        console.log(error);
        this.message.error(this.translate.instant("ERROR_CREATE_ORGANIZATION"));
        //raise error to stop batch creation
        throw error;
    }
  }

  async delOrganization(organization: Organization, batch: boolean = false) {
    try {
      await organization.destroy();
      
      if (!batch) {
        this.message.success(
          this.translate.instant("ORGANIZATION_DELETED", { name: organization.name })
        );
      }

      this.loadOrganizations();
    } catch (error) {
      this.message.error(this.translate.instant("ERROR_DELETE_USER"));
    }
  }

  delOrganizations(organizations: Array<Organization>) {
    const _delPromises = [];

    for (const organization of organizations) {
      _delPromises.push(this.delOrganization(organization, true));
    }

    Promise.all(_delPromises)
    .then(() => {
      this.message.success(this.translate.instant("ORGANIZATIONS_DELETED"));
    })
    .finally(() => this.loadOrganizations());
  }

  delSelected() {
    const _delOrganizations = this.organizations.filter((u) => u.checked);
    
    if (_delOrganizations.length === 0) {
      this.message.warning(this.translate.instant("NO_ORGANIZATIONS_SELECTED"));
      return;
    } else {
      this.modalService.confirm({
        nzTitle: this.translate.instant("DELETE_ORGANIZATION"),
        nzContent: `<p>${this.translate.instant("DELETE_ORGANIZATION_CONFIRM")}</p>
          <input nz-input placeholder="Nombre" [(ngModel)]="confirmDeleteText" ></input>`,
        nzOkText: this.translate.instant("YES"),
        nzOkType: "danger",
        nzOnOk: () => {
          this.delOrganizations(_delOrganizations);
        },
        nzCancelText: this.translate.instant("NO"),
      });
      return;
    }
  }  

  cleanImportErrors() {
    this.importErrors = [];
  }

  showModal() {
    this.showAddOrganization = true;
  }

  showModalDelete() {
    this.showMessageDelete = true;
  }

  closeModal() {
    this.shared.cleanForm(this.validateForm);
    this.showAddOrganization = false;
    this.showEditOrganization = false;
  }

  async showModalEdit(modalEditUser: Organization) {
    this.organizationOriginal = modalEditUser;

    this.validateForm.controls["name"].setValue(modalEditUser.name);

    this.showEditOrganization = true;
  }
  async submitFormOrganization(form: FormGroup) {
    this.shared.doFormDirty(form);
    if (form.pending) {
      const sub = form.statusChanges.subscribe(() => {
        if (form.valid) {
          this.submitForm(form.value);
        }
        sub.unsubscribe();
      });
    } else if (form.valid) {
      this.submitForm(form.value);
    }
  }

  async submitForm(value: any) {
    try {
      if (this.showAddOrganization) {
        await this.addOrganization(
          value.name
        );
      } 

      this.loadOrganizations();
    } catch (error) {
      console.error(error);
      this.message.create(
        "error",
        "Error al guardar la información del usuario"
      );
    }
    this.closeModal();
  }

  onBack() {
    this.router.navigate(["/control-panel"]).finally();
  }



}


export interface CacheItem extends Organization {
  data: any;
  editItem: boolean;
  newItem: boolean;
}