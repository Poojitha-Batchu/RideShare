import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { RideDetailsCard } from '../../components/ride-details-card/ride-details-card';
import { Rides } from '../../services/rides';
import { CommonModule } from '@angular/common';
import { NoRides } from '../../components/no-rides/no-rides';

@Component({
    selector: 'app-dashboard-page',
    imports: [Navbar, CommonModule, RideDetailsCard, NoRides],
    standalone: true,
    templateUrl: './dashboard-page.html',
    styleUrls: ['./dashboard-page.css'],
})
export class DashboardPage implements OnInit {
    rides: any[] = [];
    hadRides: boolean = false;

    constructor(private rideService: Rides, private cdr: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.getAllRides();
    }

    getAllRides() {
        this.rideService.getRides().subscribe({
            next: (res: any) => {
                console.log("All Rides:", res);
                this.rides = res.data;
                this.hadRides = this.rides.length > 0;
                this.cdr.detectChanges();
            },
            error: (err) => {
                // console.log(err);
                this.rides = [];
                this.hadRides = false;
                this.cdr.detectChanges();
            },
        });
    }
}
