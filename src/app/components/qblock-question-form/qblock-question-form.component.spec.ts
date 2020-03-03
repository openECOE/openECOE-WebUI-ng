import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QblockQuestionFormComponent } from './qblock-question-form.component';

describe('QblockQuestionFormComponent', () => {
  let component: QblockQuestionFormComponent;
  let fixture: ComponentFixture<QblockQuestionFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QblockQuestionFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QblockQuestionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
