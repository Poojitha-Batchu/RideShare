import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_CONFIG } from './api-config';


@Injectable({
    providedIn: 'root',
})
export class Reviews {

    private reviewsBaseUrl = `${API_CONFIG.baseUrl}/reviews`;
    private submitReviewUrl = `${this.reviewsBaseUrl}/add-review/`;
    private getReviewUrl = `${this.reviewsBaseUrl}/get-review/`; // + booking_id

    // Dynamic Headers
    getHeaders() {
        const token = localStorage.getItem('access_token');
        return new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
    }

    constructor(private http: HttpClient) { }

    submitReview(data: any) {
        return this.http.post(this.submitReviewUrl, data, { headers: this.getHeaders() });
    }

    getReview(bookingId: number) {
        return this.http.get(`${this.getReviewUrl}${bookingId}/`, { headers: this.getHeaders() } );
    }
}
