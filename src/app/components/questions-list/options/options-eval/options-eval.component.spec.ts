import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionsEvalComponent } from './options-eval.component';

describe('OptionsEvalComponent', () => {
  let component: OptionsEvalComponent;
  let fixture: ComponentFixture<OptionsEvalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OptionsEvalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionsEvalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
