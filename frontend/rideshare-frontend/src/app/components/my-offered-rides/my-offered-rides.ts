import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Bookings } from '../../services/bookings';
import { Message } from '../message/message';
import { Router } from '@angular/router';
import { Rides } from '../../services/rides';
import { RideChat } from '../ride-chat/ride-chat';
import { NoRides } from '../no-rides/no-rides';
import { AppLogger } from '../../services/app-logger';
import { buildProfileImageUrl } from '../../services/profile-image-url';

@Component({
    selector: 'app-my-offered-rides',
    imports: [CommonModule, DatePipe, Message, RideChat, NoRides],
    templateUrl: './my-offered-rides.html',
    styleUrl: './my-offered-rides.css',
})
export class MyOfferedRides implements OnInit {
    rides: any[] = [];
    openedRideId: number | null = null; // to track which ride's passengers are shown
    selectedRide: any = null;  // to hold the ride being cancelled, started, or completed
    showCancelPopup = false;   // to control cancel confirmation popup visibility
    cancelSuccessMessage = '';
    cancelErrorMessage = '';

    showStartRidePopup = false;  // to control start ride confirmation popup visibility
    startRideSuccessMessage = '';
    startRideErrorMessage = '';

    showCompleteRidePopup = false;  // to control complete ride confirmation popup visibility
    completeRideSuccessMessage = '';
    completeRideErrorMessage = '';

    showChat = false;  // to control chat visibility
    pickupLocation: string = '';
    dropLocation: string = '';

    groupedRides: any[] = [];  // to hold rides grouped by date for better display

    constructor(private bookingService: Bookings, private cdr: ChangeDetectorRef, private router: Router, private rideService: Rides) { }

    getPassengerImageUrl(imageValue: string | null | undefined): string {
        return buildProfileImageUrl(imageValue);
    }

    ngOnInit(): void {
        this.loadMyRides();
    }

    groupRidesByDate() {
        const grouped: any = {};
        const openState = new Map(this.groupedRides.map((group: any) => [group.date, group.isOpen]));

        this.rides.forEach((ride: any) => {
            const date = ride.pickup_date;
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(ride);
        });

        this.groupedRides = Object.keys(grouped).map(date => ({
            date,
            isOpen: openState.get(date) ?? false,
            rides: grouped[date]
        }));
        this.cdr.detectChanges();
    }

    toggleRideDate(group: any) {
        group.isOpen = !group.isOpen;
        this.cdr.detectChanges();
    }

    // Load the rides offered by the current user
    loadMyRides() {
        this.bookingService.getMyOfferedRides().subscribe({
            next: (res: any) => {
                AppLogger.debug('Offered rides response:', res);
                this.rides = res.data;

                this.groupRidesByDate();
                // console.log('Rides array:', this.rides);
                this.cdr.detectChanges();
            },

            error: (err: any) => {
                AppLogger.error('Error loading offered rides:', err);
                this.cdr.detectChanges();
            }
        });
    }

    // Toggle the display of passengers for a specific ride
    togglePassengers(rideId: number) {
        if (this.openedRideId === rideId) {
            this.openedRideId = null;
        }
        else {
            this.openedRideId = rideId;
        }
        this.cdr.detectChanges();
    }

    // open the cancel ride confirmation popup
    openCancelRidePopup(ride_id: any) {
        this.selectedRide = this.rides.find((ride) => ride.ride_id === ride_id);
        this.showCancelPopup = true;
        this.cdr.detectChanges();
    }

    // close the cancel ride confirmation popup
    closeCancelPopup() {
        this.showCancelPopup = false;
        this.selectedRide = null;
        this.cdr.detectChanges();
    }

    // confirm cancellation of the ride
    confirmCancelRide() {

        // reset messages first (important)
        this.cancelSuccessMessage = '';
        this.cancelErrorMessage = '';
        this.cdr.detectChanges();

        this.bookingService.cancelRide({ ride_id: this.selectedRide.ride_id }).subscribe({
            next: (res: any) => {
                this.cancelSuccessMessage = res.message;

                // update ride status immediately
                this.rides = this.rides.map((ride) => {
                    if (ride.ride_id === this.selectedRide.ride_id) {
                        return {
                            ...ride,
                            status: 'CANCELLED'
                        };
                    }
                    return ride;
                });

                // Regroup rides to ensure UI reflects the changes
                this.groupRidesByDate();

                setTimeout(() => {
                    this.cancelSuccessMessage = '';
                    this.closeCancelPopup();
                    this.cdr.detectChanges();
                }, 2000);
            },

            error: (err: any) => {
                this.cancelErrorMessage = err.error.message;
                this.cdr.detectChanges();

                setTimeout(() => {
                    this.cancelErrorMessage = '';
                    this.cdr.detectChanges();
                }, 2000);
            }
        });
    }

    // navigate to the edit ride page with the selected ride's data
    editRide(ride: any) {
        this.router.navigate(['/rides/offer-ride'], {
            state: { ride }
        });
    }

    // open the start ride confirmation popup
    openStartRidePopup(ride: any) {
        this.selectedRide = ride;
        this.showStartRidePopup = true;
        this.cdr.detectChanges();
    }

    // close the start ride confirmation popup
    closeStartRidePopup() {
        this.showStartRidePopup = false;
        this.selectedRide = null;
        this.cdr.detectChanges();
    }

    // check if the ride can be started (only allow starting within 30 minutes before pickup time
    // and if it's not already cancelled, completed, or started)
    canStartRide(ride: any): boolean {

        if (
            ride.status === 'CANCELLED' || ride.status === 'COMPLETED' || ride.status === 'STARTED') {
            return false;
        }

        const pickupDateTime = new Date(`${ride.pickup_date}T${ride.pickup_time}`);
        const now = new Date();

        const startAllowedTime = new Date(pickupDateTime.getTime() - (30 * 60 * 1000)); // 30 minutes before pickup time

        return now >= startAllowedTime;
    }

    // confirm starting the ride
    confirmStartRide() {

        this.rideService.startRide(this.selectedRide.ride_id).subscribe({

            next: (res: any) => {

                this.startRideSuccessMessage = res.message;

                // Update ride status immediately in the rides array
                this.rides = this.rides.map((ride) => {
                    if (ride.ride_id === this.selectedRide.ride_id) {
                        return {
                            ...ride,
                            status: 'STARTED'
                        };
                    }
                    return ride;
                });

                // Regroup rides to ensure UI reflects the changes
                this.groupRidesByDate();

                setTimeout(() => {
                    this.startRideSuccessMessage = '';
                    this.closeStartRidePopup();
                    this.cdr.detectChanges();
                }, 2000);
            },

            error: (err: any) => {
                AppLogger.error('Failed to start ride:', err);
                this.startRideErrorMessage = err.error.message;
                this.cdr.detectChanges();

                setTimeout(() => {
                    this.startRideErrorMessage = '';
                    this.cdr.detectChanges();
                }, 2000);
            }
        });
    }

    // open the complete ride confirmation popup
    openCompleteRidePopup(ride: any) {
        this.selectedRide = ride;
        this.showCompleteRidePopup = true;
        this.cdr.detectChanges();
    }

    // close the complete ride confirmation popup
    closeCompleteRidePopup() {
        this.showCompleteRidePopup = false;
        this.selectedRide = null;
        this.cdr.detectChanges();
    }

    // confirm completion of the ride
    confirmCompleteRide() {

        this.rideService.completeRide(this.selectedRide.ride_id).subscribe({
            next: (res: any) => {
                this.completeRideSuccessMessage = res.message;

                // Update ride status immediately in the rides array
                this.rides = this.rides.map((ride) => {
                    if (ride.ride_id === this.selectedRide.ride_id) {
                        return {
                            ...ride,
                            status: 'COMPLETED'
                        };
                    }
                    return ride;
                });

                // Regroup rides to ensure UI reflects the changes
                this.groupRidesByDate();

                setTimeout(() => {
                    this.completeRideSuccessMessage = '';
                    this.closeCompleteRidePopup();
                    this.cdr.detectChanges();
                }, 2000);
            },

            error: (err: any) => {
                AppLogger.error('Failed to complete ride:', err);
                this.completeRideErrorMessage = err.error.message;
                this.cdr.detectChanges();

                setTimeout(() => {
                    this.completeRideErrorMessage = '';
                    this.cdr.detectChanges();
                }, 2000);
            }
        });
    }

    // open the chat component for the selected ride
    openChat(rideId: number, pickupLocation: string, dropLocation: string) {
        this.selectedRide = rideId;
        this.pickupLocation = pickupLocation;
        this.dropLocation = dropLocation;
        this.showChat = true;
    }

    // close the chat component
    closeChat() {
        this.showChat = false;
    }
}
