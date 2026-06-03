import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class Bookings {

    private bookingBaseUrl = 'http://localhost:8000/bookings';

    private bookRideUrl = `${this.bookingBaseUrl}/book-ride/`;
    private myBookingsUrl = `${this.bookingBaseUrl}/my-bookings/`;
    private cancelBookingUrl = `${this.bookingBaseUrl}/cancel-booking/`;
    private myOfferedRidesUrl = `${this.bookingBaseUrl}/my-offered-rides/`;
    private cancelRideUrl = `${this.bookingBaseUrl}/cancel-ride/`;
    private markPaymentAsPaidUrl = `${this.bookingBaseUrl}/mark-payment-paid/`;

    // Dynamic Headers
    getHeaders() {
        const token = localStorage.getItem('access_token');
        return new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
    }

    constructor(private http: HttpClient) { }

    bookRide(data: any) {
        return this.http.post(this.bookRideUrl, data, { headers: this.getHeaders() });
    }

    getMyBookings() {
        return this.http.get(this.myBookingsUrl, { headers: this.getHeaders() });
    }

    cancelBooking(data: any) {
        return this.http.post(this.cancelBookingUrl, data, { headers: this.getHeaders() });
    }

    getMyOfferedRides() {
        return this.http.get(this.myOfferedRidesUrl, { headers: this.getHeaders() });
    }

    cancelRide(data: any) {
        return this.http.post(this.cancelRideUrl, data, { headers: this.getHeaders() });
    }

    markPaymentAsPaid(bookingId: number) {
        return this.http.patch(`${this.markPaymentAsPaidUrl}${bookingId}/`, {}, { headers: this.getHeaders() });
    }
}
