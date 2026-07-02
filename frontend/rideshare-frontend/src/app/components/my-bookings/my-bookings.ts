import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Bookings } from '../../services/bookings';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Message } from '../message/message';
import { RideChat } from '../ride-chat/ride-chat';
import { NoRides } from '../no-rides/no-rides';
import { Reviews } from '../../services/reviews';
import { AppLogger } from '../../services/app-logger';

@Component({
    selector: 'app-my-bookings',
    imports: [DatePipe, CommonModule, FormsModule, Message, RideChat, NoRides],
    templateUrl: './my-bookings.html',
    styleUrl: './my-bookings.css',
})
export class MyBookings implements OnInit {
    bookings: any[] = [];
    selectedRideId!: number;
    selectedBookingId!: number;
    cancelSeats: number = 1;
    selectedBooking: any = null;

    showCancelPopup: boolean = false;  // FOR CANCELLATION POPUP
    cancellationSuccessMessage: string = '';
    cancellationErrorMessage: string = '';

    showChat = false; // TO CONTROL CHAT VISIBILITY
    pickupLocation: string = '';
    dropLocation: string = '';

    groupedBookings: any[] = [];  // FOR GROUPING BOOKINGS BY RIDE

    showReviewPopup = false;  // TO CONTROL REVIEW POPUP VISIBILITY
    selectedReviewBooking: any = null;
    selectedRating = 0;
    reviewSuccessMessage = '';
    reviewErrorMessage = '';
    alreadyRated = false;

    showPaymentPopup = false;  // TO CONTROL PAYMENT POPUP VISIBILITY
    selectedPaymentBooking: any = null;
    paymentSuccessMessage = '';
    paymentErrorMessage = '';


    constructor(
        private bookingService: Bookings,
        private cdr: ChangeDetectorRef,
        private reviewService: Reviews
    ) { }

    // TO INITIALIZE COMPONENT
    ngOnInit(): void {
        this.loadBookings();
    }

    // TO GROUP BOOKINGS BY RIDE
    groupBookingsByDate() {
        const grouped: any = {};
        const openState = new Map(this.groupedBookings.map((group: any) => [group.date, group.isOpen]));

        this.bookings.forEach((booking: any) => {
            const date = booking.pickup_date;
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(booking);
        });

        this.groupedBookings = Object.keys(grouped).map(date => ({
            date,
            isOpen: openState.get(date) ?? false,
            rides: grouped[date]
        }));
        this.cdr.detectChanges();
    }

    // TO TOGGLE DATE GROUP
    toggleDateDropdown(group: any) {
        group.isOpen = !group.isOpen;
        this.cdr.detectChanges();
    }

    // TO LOAD BOOKINGS
    loadBookings() {
        this.bookingService.getMyBookings().subscribe({
            next: (res: any) => {
                AppLogger.debug('My bookings response:', res);
                this.bookings = res.data || [];

                this.bookings.sort((a, b) => {
                    const dateA = new Date(`${a.pickup_date}T${a.pickup_time}`).getTime();
                    const dateB = new Date(`${b.pickup_date}T${b.pickup_time}`).getTime();
                    return dateB - dateA;
                });

                this.groupBookingsByDate();
                this.cdr.detectChanges();
            },

            error: (err: any) => {
                AppLogger.error('Failed to load bookings:', err);
            },
        });
    }

    // TO OPEN CANCEL POPUP
    openCancelPopup(booking: any) {
        if (booking.booking_status === 'CANCELLED') {
            return;
        }

        this.selectedBooking = booking;
        this.cancelSeats = 1;
        this.showCancelPopup = true;
        this.cdr.detectChanges();
    }

    // TO CLOSE CANCEL POPUP
    closeCancelPopup() {
        this.showCancelPopup = false;
        this.selectedBooking = null;
        this.cancelSeats = 1;
        this.cdr.detectChanges();
    }

    // TO CONFIRM CANCELLATION
    confirmCancelBooking() {
        if (!this.selectedBooking) {
            return;
        }
        const cancelData = {
            booking_id: this.selectedBooking.booking_id,
            cancel_seats: this.cancelSeats,
        };

        this.bookingService.cancelBooking(cancelData).subscribe({
            next: (res: any) => {
                AppLogger.debug('My booking cancellation response:', res);
                this.cancellationSuccessMessage = res.message;

                // UPDATE UI
                this.bookings = this.bookings.map((booking) => {
                    if (booking.booking_id === this.selectedBooking.booking_id) {
                        // FULL CANCEL
                        if (res.data.booking_cancelled === true) {
                            return {
                                ...booking,
                                booking_status: 'CANCELLED',
                                seats_booked: 0,
                            };
                        }

                        // PARTIAL CANCEL
                        return {
                            ...booking,
                            seats_booked: res.data.remaining_booked_seats,
                        };
                    }
                    return booking;
                });

                // Regroup bookings to ensure UI reflects the changes
                this.groupBookingsByDate();

                // CLEAR SUCCESS MESSAGE
                setTimeout(() => {
                    this.cancellationSuccessMessage = '';
                    this.closeCancelPopup();
                    this.cdr.detectChanges();
                }, 2000);
            },

            error: (err: any) => {
                AppLogger.error('My booking cancellation error:', err);

                this.cancellationErrorMessage = err?.error?.message || 'Cancellation failed';
                this.cdr.detectChanges();

                setTimeout(() => {
                    this.cancellationErrorMessage = '';
                    this.closeCancelPopup();
                    this.cdr.detectChanges();
                }, 2000);
            },
        });
    }

    // TO OPEN CHAT
    openChat(rideId: number, pickupLocation: string, dropLocation: string, bookingId: number) {
        this.selectedRideId = rideId;
        this.selectedBookingId = bookingId;
        this.pickupLocation = pickupLocation;
        this.dropLocation = dropLocation;
        this.showChat = true;
    }

    // TO CLOSE CHAT
    closeChat() {
        this.showChat = false;
    }

    // TO OPEN REVIEW POPUP
    openReviewPopup(booking: any) {
        this.selectedReviewBooking = booking;
        this.selectedRating = 0;
        this.showReviewPopup = true;
        this.alreadyRated = booking.review_given;
        this.reviewSuccessMessage = '';
        this.reviewErrorMessage = '';

        // FETCH EXISTING REVIEW
        this.reviewService.getReview(booking.booking_id).subscribe({
            next: (res: any) => {
                if (res.already_rated) {
                    this.alreadyRated = true;
                    this.selectedRating = Number(res.rating);
                }
                this.cdr.detectChanges();
            },

            error: (err) => {
                AppLogger.error('Failed to load review status:', err);
                this.cdr.detectChanges();
            }
        });
    }

    // TO CLOSE REVIEW POPUP
    closeReviewPopup() {
        this.showReviewPopup = false;
        this.selectedReviewBooking = null;
        this.selectedRating = 0;
        this.cdr.detectChanges();
    }

    // TO SUBMIT REVIEW
    submitReview() {
        if (!this.selectedRating && !this.alreadyRated) {
            this.reviewErrorMessage = 'Please select rating';
            setTimeout(() => {
                this.reviewErrorMessage = '';
                this.cdr.detectChanges();
            }, 2000);
            return;
        }

        const rating_data = {
            booking_id: this.selectedReviewBooking.booking_id,
            rating: this.selectedRating
        };

        this.reviewService.submitReview(rating_data).subscribe({
            next: (res: any) => {
                // SUCCESS
                this.reviewSuccessMessage = res.message;

                // Update bookings to reflect that review was given
                this.bookings = this.bookings.map((booking: any) => {
                    if (booking.booking_id === this.selectedReviewBooking.booking_id) {
                        return {
                            ...booking,
                            review_given: true
                        };
                    }
                    return booking;
                });

                // Regroup bookings to ensure UI reflects the changes
                this.groupBookingsByDate();

                setTimeout(() => {
                    this.reviewSuccessMessage = '';
                    this.closeReviewPopup();
                    this.cdr.detectChanges();
                }, 2000);
            },

            error: (err) => {
                this.reviewErrorMessage = err.error.message;
                this.cdr.detectChanges();

                setTimeout(() => {
                    this.reviewErrorMessage = '';
                    this.cdr.detectChanges();
                }, 2000);
            }
        });
    }

    // OPEN PAYMENT POPUP
    openPaymentPopup(booking: any) {
        this.selectedPaymentBooking = booking;
        this.showPaymentPopup = true;
        this.paymentSuccessMessage = '';
        this.paymentErrorMessage = '';
        this.cdr.detectChanges();
    }


    // CLOSE PAYMENT POPUP
    closePaymentPopup() {
        this.showPaymentPopup = false;
        this.selectedPaymentBooking = null;
        this.cdr.detectChanges();
    }


    // CONFIRM PAYMENT
    confirmPayment() {

        if (!this.selectedPaymentBooking) {
            return;
        }

        const bookingId = this.selectedPaymentBooking.booking_id;
        this.bookingService.markPaymentAsPaid(bookingId).subscribe({

            next: (res: any) => {

                this.paymentSuccessMessage = res.message;

                // UPDATE UI
                this.bookings = this.bookings.map((booking: any) => {
                    if (booking.booking_id === bookingId) {
                        return {
                            ...booking,
                            payment_status: 'PAID'
                        };
                    }
                    return booking;
                });

                // Regroup bookings to ensure UI reflects the changes
                this.groupBookingsByDate();

                setTimeout(() => {
                    this.paymentSuccessMessage = '';
                    this.closePaymentPopup();
                    this.cdr.detectChanges();
                }, 2000);
            },

            error: (err: any) => {

                this.paymentErrorMessage = err?.error?.message || 'Payment failed';
                this.cdr.detectChanges();

                setTimeout(() => {
                    this.paymentErrorMessage = '';
                    this.cdr.detectChanges();
                }, 2000);
            }
        });
    }

    getDriverImageUrl(booking: any): string | null {
        const imageUrl = booking.driver_image;
        if (!imageUrl) {
            return null;
        }
        return imageUrl;
    }
}
