import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';

@Component({
    selector: 'app-my-rides',
    imports: [Navbar, CommonModule, RouterOutlet],
    templateUrl: './my-rides.html',
    styleUrl: './my-rides.css',
})
export class MyRides implements OnInit {
    activeTab: string = 'bookings';

    constructor(private router: Router, private route: ActivatedRoute) {}

    ngOnInit() {
        // Set active tab based on current route
        this.updateActiveTab();
    }

    private updateActiveTab() {
        const url = this.router.url;
        if (url.includes('offered-rides')) {
            this.activeTab = 'offered';
        } else {
            this.activeTab = 'bookings';
        }
    }

    setTab(tab: string) {
        this.activeTab = tab;
        if (tab === 'bookings') {
            this.router.navigate(['my-bookings'],  { relativeTo: this.route });
        } else if (tab === 'offered') {
            this.router.navigate(['my-offered-rides'],  { relativeTo: this.route });
        }
    }
}
