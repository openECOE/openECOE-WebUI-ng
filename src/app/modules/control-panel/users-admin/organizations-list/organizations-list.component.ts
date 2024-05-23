import { Component, EventEmitter, Input, NgZone, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ParserFile } from '@app/components/upload-and-parse/upload-and-parse.component';
import { Organization } from '@app/models';
import { ApiService } from '@app/services/api/api.service';
import { OrganizationsService } from '@app/services/organizations-service/organizations.service';
import { SharedService } from '@app/services/shared/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

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
  organizationDelete: Organization;

  validateForm: FormGroup;
  showAddOrganization: boolean = false;
  showMessageDelete: boolean = false;
  showEditOrganization: boolean = false;

  idx: any;
  item: any;

  confirmDeleteText: string = '';

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

    this.validateForm.get('name').valueChanges.subscribe(value => {
      this.confirmDeleteText = value;
    });

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

  async updateOrganization(organization: Organization, value: any) {
    const updateData = {
      name: value.name,
    };

    await organization.update(updateData);

    this.message.success(
      this.translate.instant("ORGANIZATION_UPDATED", { name: organization.name })
    );
  }

  async saveOrganization(item: any) {
    this.loading = true;
    const orgcache = this.editCache.find((f) => f.data.id === item.id);
    if (!orgcache.data.email) {
      this.loading = false;
      orgcache.editItem = false;
      return;
    }

    const body = {
      name: orgcache.data.name || "-",
    };

    const request = item.update(body);

    request
      .then(() => {
        this.loadOrganizations();
        orgcache.editItem = false;
      })
      .finally(() => (this.loading = false));
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

    this.showMessageDelete = false;
  }

  showModal() {
    this.showAddOrganization = true;
  }

  showModalDelete(modalDelteOrganization: Organization) {
    this.organizationDelete = modalDelteOrganization;

    this.showMessageDelete = true;
  }
  
  closeModal() {
    this.shared.cleanForm(this.validateForm);
    this.showAddOrganization = false;
    this.showEditOrganization = false;
    this.showMessageDelete = false;
  }

  async showModalEdit(modalEditOrganization: Organization) {
    this.organizationOriginal = modalEditOrganization;

    this.validateForm.controls["name"].setValue(modalEditOrganization.name);

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
      } else if (this.showEditOrganization) {
        await this.updateOrganization(this.organizationOriginal, value);
      }

      this.loadOrganizations();
    } catch (error) {
      console.error(error);
    }
    this.closeModal();
  }
}

export interface CacheItem extends Organization {
  data: any;
  editItem: boolean;
  newItem: boolean;
}