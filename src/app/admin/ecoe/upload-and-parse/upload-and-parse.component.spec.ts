import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadAndParseComponent } from './upload-and-parse.component';

describe('UploadAndParseComponent', () => {
  let component: UploadAndParseComponent;
  let fixture: ComponentFixture<UploadAndParseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadAndParseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadAndParseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
