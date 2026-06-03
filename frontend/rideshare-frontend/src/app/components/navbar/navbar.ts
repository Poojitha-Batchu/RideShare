import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Authentication } from '../../services/authentication';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-navbar',
    imports: [RouterModule, CommonModule],
    templateUrl: './navbar.html',
    styleUrl: './navbar.css',
})
export class Navbar implements OnInit, OnDestroy {
    loggedInUser: any = null;
    showLogoutPopup: boolean = false;
    private userDataSubscription: Subscription | null = null;

    constructor(private route: Router, private authService: Authentication) { }

    ngOnInit(): void {
        const user = localStorage.getItem('user');

        if (user) {
            this.loggedInUser = JSON.parse(user);
        }

        // Subscribe to user data changes
        this.userDataSubscription = this.authService.userDataChanged.subscribe((updatedUser: any) => {
            this.loggedInUser = updatedUser;
        });
    }

    ngOnDestroy(): void {
        // Unsubscribe to prevent memory leaks
        if (this.userDataSubscription) {
            this.userDataSubscription.unsubscribe();
        }
    }

    // ✅ Open popup
    openLogoutPopup() {
        this.showLogoutPopup = true;
    }

    // ✅ Close popup
    closeLogoutPopup() {
        this.showLogoutPopup = false;
    }

    // ✅ Confirm logout
    confirmLogout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');

        this.showLogoutPopup = false;
        this.route.navigate(['']);
    }

    getProfile() {
        this.route.navigate(['/profile']);
    }
}
