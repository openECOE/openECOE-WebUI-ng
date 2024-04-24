import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeOrganizationComponent } from './change-organization.component';

describe('ChangeOrganizationComponent', () => {
  let component: ChangeOrganizationComponent;
  let fixture: ComponentFixture<ChangeOrganizationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeOrganizationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeOrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
