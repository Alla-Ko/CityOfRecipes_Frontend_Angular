import { TestBed } from '@angular/core/testing';

import { GeographyService } from './geography.service';

describe('GeographyService', () => {
  let service: GeographyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeographyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
