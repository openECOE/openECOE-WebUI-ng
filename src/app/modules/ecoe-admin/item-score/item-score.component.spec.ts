import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemScoreComponent } from './item-score.component';

describe('ItemScoreComponent', () => {
  let component: ItemScoreComponent;
  let fixture: ComponentFixture<ItemScoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemScoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
