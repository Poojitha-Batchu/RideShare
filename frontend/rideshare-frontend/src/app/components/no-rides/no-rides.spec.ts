import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoRides } from './no-rides';

describe('NoRides', () => {
  let component: NoRides;
  let fixture: ComponentFixture<NoRides>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoRides],
    }).compileComponents();

    fixture = TestBed.createComponent(NoRides);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
