import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QblockFormComponent } from './qblock-form.component';

describe('QblockFormComponent', () => {
  let component: QblockFormComponent;
  let fixture: ComponentFixture<QblockFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QblockFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QblockFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
