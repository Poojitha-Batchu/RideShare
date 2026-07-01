import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_CONFIG } from './api-config';

@Injectable({
    providedIn: 'root',
})
export class Rides {

    private baseUrl = `${API_CONFIG.baseUrl}/rides`;
    private getRidesUrl = `${this.baseUrl}/all/`;
    private offerRideUrl = `${this.baseUrl}/offer-ride/`;
    private searchRidesUrl = `${this.baseUrl}/search-ride/`;
    private updateRideUrl = `${this.baseUrl}/update-ride/`;
    private startRideUrl = `${this.baseUrl}/start-ride/`;
    private completeRideUrl = `${this.baseUrl}/complete-ride/`;


    // Dynamic Headers
    getHeaders() {
        const token = localStorage.getItem('access_token');
        return new HttpHeaders({
            Authorization: `Bearer ${token}`
        });

    }

    constructor(private http: HttpClient) { }

    getRides() {
        return this.http.get(this.getRidesUrl, { headers: this.getHeaders() });
    }

    offerRide(rideData: any) {
        return this.http.post(this.offerRideUrl, rideData, { headers: this.getHeaders() });
    }

    searchRides(data: any) {
        return this.http.post(this.searchRidesUrl, data, { headers: this.getHeaders() });
    }

    updateRide(rideId: number, data: any) {
        return this.http.put(`${this.updateRideUrl}${rideId}/`, data, { headers: this.getHeaders() });
    }

    startRide(rideId: number) {
        return this.http.patch(`${this.startRideUrl}${rideId}/`,{}, { headers: this.getHeaders() });
    }

    completeRide(rideId: number) {
        return this.http.patch(`${this.completeRideUrl}${rideId}/`,{}, { headers: this.getHeaders() });
    }
}
