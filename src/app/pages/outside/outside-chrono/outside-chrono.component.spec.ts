import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutsideChronoComponent } from './outside-chrono.component';

describe('OutsideChronoComponent', () => {
  let component: OutsideChronoComponent;
  let fixture: ComponentFixture<OutsideChronoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutsideChronoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutsideChronoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
