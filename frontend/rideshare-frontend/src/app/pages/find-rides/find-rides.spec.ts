import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindRides } from './find-rides';

describe('FindRides', () => {
  let component: FindRides;
  let fixture: ComponentFixture<FindRides>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FindRides],
    }).compileComponents();

    fixture = TestBed.createComponent(FindRides);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
