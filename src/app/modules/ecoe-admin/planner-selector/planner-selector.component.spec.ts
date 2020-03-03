import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlannerSelectorComponent } from './planner-selector.component';

describe('PlannerSelectorComponent', () => {
  let component: PlannerSelectorComponent;
  let fixture: ComponentFixture<PlannerSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlannerSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlannerSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
