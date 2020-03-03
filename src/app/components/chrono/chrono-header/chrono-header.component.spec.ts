import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChronoHeaderComponent } from './chrono-header.component';

describe('ChronoHeaderComponent', () => {
  let component: ChronoHeaderComponent;
  let fixture: ComponentFixture<ChronoHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChronoHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChronoHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
