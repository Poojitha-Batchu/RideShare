import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyOfferedRides } from './my-offered-rides';

describe('MyOfferedRides', () => {
  let component: MyOfferedRides;
  let fixture: ComponentFixture<MyOfferedRides>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyOfferedRides],
    }).compileComponents();

    fixture = TestBed.createComponent(MyOfferedRides);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
