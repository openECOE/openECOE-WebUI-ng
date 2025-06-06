import { TestBed } from '@angular/core/testing';

import { QuestionOfflineService } from './question-offline.service';

describe('QuestionOfflineService', () => {
  let service: QuestionOfflineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuestionOfflineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
