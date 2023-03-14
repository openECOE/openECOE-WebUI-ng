import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcoeResultsComponent } from './ecoe-results.component';

describe('EcoeResultsComponent', () => {
  let component: EcoeResultsComponent;
  let fixture: ComponentFixture<EcoeResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcoeResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcoeResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
