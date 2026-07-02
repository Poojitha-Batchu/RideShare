import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Bookings } from '../../services/bookings';
import { FormsModule } from '@angular/forms';
import { Message } from '../message/message';
import { AppLogger } from '../../services/app-logger';

@Component({
    selector: 'app-ride-details-card',
    imports: [CommonModule, FormsModule, Message],
    standalone: true,
    templateUrl: './ride-details-card.html',
    styleUrls: ['./ride-details-card.css'],
})
export class RideDetailsCard {
    @Input() rides: any[] = [];

    userData = JSON.parse(
        localStorage.getItem('user') || '{}'
    );
    currentUserId = this.userData.id;

    selectedRide: any = null;
    seatsBooked: number = 1;
    showBookingPopup: boolean = false;
    successMessage = '';
    errorMessage = '';
    paymentMethod = '';

    constructor(private bookingService: Bookings, private cdr: ChangeDetectorRef) { }

    openBookingPopup(ride: any) {
        AppLogger.debug('Current user id:', this.currentUserId);
        if (ride.available_seats === 0) {
            return;
        }

        this.selectedRide = ride;
        this.seatsBooked = 1;
        this.showBookingPopup = true;
        this.cdr.detectChanges();
    }

    closePopup() {
        this.showBookingPopup = false;
        this.cdr.detectChanges();
    }

    confirmBooking() {
        this.errorMessage = '';
        this.successMessage = '';

        if (!this.paymentMethod) {
            this.errorMessage ='Please select payment method';
            this.cdr.detectChanges();

            setTimeout(() => {
                    this.errorMessage = '';
                    this.cdr.detectChanges();
                }, 2000);

            return;
        }

        const bookingData = {
            ride_id: this.selectedRide?.id,
            seats_booked: this.seatsBooked,
            payment_method: this.paymentMethod
        };

        AppLogger.debug('Booking data:', bookingData);
        AppLogger.debug('Selected ride:', this.selectedRide);

        this.bookingService.bookRide(bookingData).subscribe({

            next: (res: any) => {
                AppLogger.debug('Booking response:', res);

                this.successMessage = res.message;

                // Update UI seats instantly
                this.selectedRide.available_seats = res.data.remaining_seats;

                // FULL status
                if (this.selectedRide.available_seats === 0) {
                    this.selectedRide.status = 'FULL';
                }

                this.cdr.detectChanges();

                // Clear error message after 2 seconds
                setTimeout(() => {
                    this.closePopup();
                    this.successMessage = '';
                    this.cdr.detectChanges();
                }, 2000);
            },

            error: (err: any) => {
                AppLogger.error('Booking failed:', err);
                this.errorMessage = err.error.message;
                this.cdr.detectChanges();

                // Clear error message after 2 seconds
                setTimeout(() => {
                    this.errorMessage = '';
                    this.closePopup();
                    this.cdr.detectChanges();
                }, 2000);
            }
        });
    }
}
