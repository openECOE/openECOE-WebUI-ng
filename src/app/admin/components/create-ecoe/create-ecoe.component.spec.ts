import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEcoeComponent } from './create-ecoe.component';

describe('CreateEcoeComponent', () => {
  let component: CreateEcoeComponent;
  let fixture: ComponentFixture<CreateEcoeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateEcoeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEcoeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
