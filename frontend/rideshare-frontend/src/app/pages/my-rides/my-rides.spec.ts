import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyRides } from './my-rides';

describe('MyRides', () => {
  let component: MyRides;
  let fixture: ComponentFixture<MyRides>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyRides],
    }).compileComponents();

    fixture = TestBed.createComponent(MyRides);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
