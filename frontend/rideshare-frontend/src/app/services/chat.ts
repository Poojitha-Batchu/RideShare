import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_CONFIG } from './api-config';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    private baseUrl = `${API_CONFIG.baseUrl}/chat`;

    constructor(private http: HttpClient) { }

    getHeaders() {
        const token = localStorage.getItem('access_token');

        return new HttpHeaders({
            Authorization: `Bearer ${token}`,
        });
    }

    getMessages(rideId: number, bookingId?: number) {

        let url = `${this.baseUrl}/messages/${rideId}/` ;

        if (bookingId) {
            url += `?booking_id=${bookingId}`;
        }

        return this.http.get(url, {
            headers: this.getHeaders(),
        });
    }

    sendMessage(rideId: number, message: string) {
        return this.http.post(
            `${this.baseUrl}/send/${rideId}/`,
            { message },
            {
                headers: this.getHeaders(),
            },
        );
    }
}
