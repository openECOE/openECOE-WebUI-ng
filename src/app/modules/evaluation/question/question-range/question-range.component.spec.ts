import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionRangeComponent } from './question-range.component';

describe('QuestionRangeComponent', () => {
  let component: QuestionRangeComponent;
  let fixture: ComponentFixture<QuestionRangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionRangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
