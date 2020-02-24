import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationDetailsComponent } from './evaluation-details.component';

describe('EvaluationDetailsComponent', () => {
  let component: EvaluationDetailsComponent;
  let fixture: ComponentFixture<EvaluationDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EvaluationDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
