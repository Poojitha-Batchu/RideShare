import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RideDetailsCard } from './ride-details-card';

describe('RideDetailsCard', () => {
  let component: RideDetailsCard;
  let fixture: ComponentFixture<RideDetailsCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RideDetailsCard],
    }).compileComponents();

    fixture = TestBed.createComponent(RideDetailsCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
