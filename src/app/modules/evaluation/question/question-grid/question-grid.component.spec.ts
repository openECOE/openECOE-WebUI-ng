import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionGridComponent } from './question-grid.component';

describe('QuestionGridComponent', () => {
  let component: QuestionGridComponent;
  let fixture: ComponentFixture<QuestionGridComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [ QuestionGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
