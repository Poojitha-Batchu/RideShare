import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class Authentication {
    private backendUrl = 'http://localhost:8000';
    private signupUrl = `${this.backendUrl}/signup/`;
    private loginUrl = `${this.backendUrl}/login/`;
    private profileUrl = `${this.backendUrl}/profile/`;
    private updateProfileUrl = `${this.backendUrl}/update-profile/`;
    private forgotPasswordUrl = `${this.backendUrl}/forgot-password/`;

    // Subject to broadcast user data changes
    userDataChanged = new Subject<any>();

    // Dynamic Headers
    getHeaders() {
        const token = localStorage.getItem('access_token');
        return new HttpHeaders({
            Authorization: `Bearer ${token}`
        });

    }


    constructor(private http: HttpClient) { }

    signup(data: any) {
        return this.http.post(this.signupUrl, data);
    }

    login(data: any) {
        return this.http.post(this.loginUrl, data);
    }

    get_profile_details() {
        return this.http.get(this.profileUrl, { headers: this.getHeaders() });
    }

    update_profile(data: any) {
        return this.http.patch(this.updateProfileUrl, data, { headers: this.getHeaders() });
    }

    forgot_password(data: any) {
        return this.http.post(this.forgotPasswordUrl, data );
    }
}
