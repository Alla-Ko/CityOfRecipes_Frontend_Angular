import { TestBed } from '@angular/core/testing';

import { WowService } from './wow.service';

describe('WowService', () => {
  let service: WowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
