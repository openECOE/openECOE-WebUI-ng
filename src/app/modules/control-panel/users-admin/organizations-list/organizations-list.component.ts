import { Component, EventEmitter, Input, NgZone, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Organization } from '@app/models';
import { ApiService } from '@app/services/api/api.service';
import { OrganizationsService } from '@app/services/organizations-service/organizations.service';
import { SharedService } from '@app/services/shared/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';


interface OrganizationItem extends Organization {
  checked: boolean;
}

@Component({
  selector: 'app-organizations-list',
  templateUrl: './organizations-list.component.html',
  styleUrls: ['./organizations-list.component.less']
})
export class OrganizationsListComponent implements OnInit {
  organization: Organization;

  @Input() showDeleteButton: boolean = true;
  @Output() delete: EventEmitter<void> = new EventEmitter<void>();

  organizations: Array<OrganizationItem> = [];
  organizationsPage: any;
  editCache: CacheItem[] = [];

  page: number = 1;
  perPage: number = 20;
  totalItems: number = 0;
  loading: boolean = false;

  importErrors: { value: any; reason: any }[] = [];

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
    this.loadOrganizations();

    this.loading = false;
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
    const _organizations: Array<OrganizationItem> = [...this.organizationsPage.items];
    
    for (const organization of _organizations) {
      organization.checked = false;
    }
    
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

  cleanImportErrors() {
    this.importErrors = [];
  }

  onBack() {
    this.router.navigate(["/control-panel"]).finally();
  }
}


export interface CacheItem extends OrganizationItem {
  data: any;
  editItem: boolean;
  newItem: boolean;
}