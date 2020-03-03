import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcoeInfoComponent } from './ecoe-info.component';

describe('EcoeInfoComponent', () => {
  let component: EcoeInfoComponent;
  let fixture: ComponentFixture<EcoeInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcoeInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcoeInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
