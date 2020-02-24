import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutsideComponent } from './outside.component';

describe('OutsideComponent', () => {
  let component: OutsideComponent;
  let fixture: ComponentFixture<OutsideComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutsideComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutsideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
