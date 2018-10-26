import { TestBed } from '@angular/core/testing';

import { ActionMessagesService } from './action-messages.service';

describe('ActionMessagesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ActionMessagesService = TestBed.get(ActionMessagesService);
    expect(service).toBeTruthy();
  });
});
