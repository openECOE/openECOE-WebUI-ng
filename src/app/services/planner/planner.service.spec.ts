import { TestBed } from '@angular/core/testing';

import { PlannerServiceService } from './planner.service';

describe('PlannerServiceService', () => {
  let service: PlannerServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlannerServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
