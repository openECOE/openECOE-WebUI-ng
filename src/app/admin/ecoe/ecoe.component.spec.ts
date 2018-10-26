import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcoeComponent } from './ecoe.component';

describe('EcoeComponent', () => {
  let component: EcoeComponent;
  let fixture: ComponentFixture<EcoeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcoeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcoeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
