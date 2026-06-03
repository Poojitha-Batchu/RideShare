import { TestBed } from '@angular/core/testing';

import { Rides } from './rides';

describe('Rides', () => {
  let service: Rides;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Rides);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
