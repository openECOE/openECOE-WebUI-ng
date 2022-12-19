import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationItemsComponent } from './evaluation-items.component';

describe('EvaluationItemsComponent', () => {
  let component: EvaluationItemsComponent;
  let fixture: ComponentFixture<EvaluationItemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EvaluationItemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluationItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
