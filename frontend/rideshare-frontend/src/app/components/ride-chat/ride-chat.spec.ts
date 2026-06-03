import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RideChat } from './ride-chat';

describe('RideChat', () => {
  let component: RideChat;
  let fixture: ComponentFixture<RideChat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RideChat],
    }).compileComponents();

    fixture = TestBed.createComponent(RideChat);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
