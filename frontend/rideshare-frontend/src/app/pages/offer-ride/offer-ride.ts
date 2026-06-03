import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Rides } from '../../services/rides';
import { Navbar } from '../../components/navbar/navbar';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Message } from '../../components/message/message';
import { inject } from '@angular/core';

@Component({
    selector: 'app-offer-ride',
    imports: [ReactiveFormsModule, Navbar, CommonModule, Message],
    templateUrl: './offer-ride.html',
    styleUrl: './offer-ride.css',
})
export class OfferRide {
    offerRideForm!: FormGroup;
    errorMessage: string = '';
    successMessage = '';
    minDate: string = new Date().toISOString().split('T')[0];

    // to edit ride
    isEditMode = false;
    rideIdToUpdate: number | null = null;

    constructor(private fb: FormBuilder, private rideService: Rides, private router: Router, private cdr: ChangeDetectorRef,) {

        const stateRide = history.state?.ride;

        if (stateRide) {
            this.isEditMode = true;
            this.rideIdToUpdate = stateRide.ride_id;

            this.offerRideForm = this.fb.group({
                pickup_location: [stateRide.pickup_location, Validators.required],
                pickup_landmark: [stateRide.pickup_landmark , Validators.required],
                drop_location: [stateRide.drop_location, Validators.required],
                drop_landmark: [stateRide.drop_landmark, Validators.required],
                pickup_date: [stateRide.pickup_date, Validators.required],
                pickup_time: [stateRide.pickup_time, Validators.required],
                vehicle_name: [stateRide.vehicle_name, Validators.required],
                vehicle_number: [
                    stateRide.vehicle_number,
                    [Validators.required, Validators.pattern(/^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/)]
                ],
                available_seats: [stateRide.available_seats, [Validators.required, Validators.min(1)]],
                price_per_seat: [stateRide.price_per_seat, [Validators.required, Validators.min(0)]],
                description: [stateRide.description || ''],
            });

        } else {
            this.initializeForm();
        }
    }

    initializeForm() {
        this.offerRideForm = this.fb.group({
            pickup_location: ['', Validators.required],
            pickup_landmark: ['', Validators.required],
            drop_location: ['', Validators.required],
            drop_landmark: ['', Validators.required],
            pickup_date: ['', Validators.required],
            pickup_time: ['', Validators.required],
            vehicle_name: ['', Validators.required],
            vehicle_number: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/)]],
            available_seats: ['', [Validators.required, Validators.min(1)]],
            price_per_seat: ['', [Validators.required, Validators.min(0)]],
            description: [''],
        });
    }

    submitRide() {

        this.errorMessage = '';
        this.successMessage = '';

        if (this.offerRideForm.invalid) {
            this.errorMessage = 'Please fill in all required fields';
            this.cdr.detectChanges();

            setTimeout(() => {
                        this.errorMessage = '';
                        this.cdr.detectChanges();
                    }, 2000);

            return;
        }

        // Prepare payload with proper data types
        let payload = this.offerRideForm.value;
        
        // Ensure numeric fields are numbers, not strings
        payload.available_seats = parseInt(payload.available_seats, 10);
        payload.price_per_seat = parseFloat(payload.price_per_seat);
        
        // 🔵 EDIT MODE
        if (this.isEditMode && this.rideIdToUpdate) {

            this.rideService.updateRide(this.rideIdToUpdate, payload).subscribe({
                next: (res: any) => {

                    this.successMessage = res.message || 'Ride updated successfully';
                    this.cdr.detectChanges();

                    setTimeout(() => {
                        this.router.navigate(['/bookings/my-offered-rides']);
                    }, 2000);
                },
                error: (err) => {
                    const errorDetails = err.error?.errors ? JSON.stringify(err.error.errors) : '';
                    this.errorMessage = err.error?.message || 'Update failed';
                    if (errorDetails) {
                        console.error('Validation errors:', err.error.errors);
                        this.errorMessage += ' - ' + errorDetails;
                    }
                    this.cdr.detectChanges();

                    setTimeout(() => {
                        this.errorMessage = '';
                        this.cdr.detectChanges();
                    }, 2000);
                }
            });

        }
        // 🟢 CREATE MODE
        else {

            this.rideService.offerRide(payload).subscribe({
                next: (res: any) => {

                    this.successMessage = res.message;
                    this.cdr.detectChanges();

                    setTimeout(() => {
                        this.router.navigate(['/dashboard']);
                    }, 2000);
                },
                error: (err) => {
                    // Show detailed error information
                    const errorDetails = err.error?.errors ? JSON.stringify(err.error.errors) : '';
                    this.errorMessage = err.error?.message || 'Failed to offer ride';
                    if (errorDetails) {
                        console.error('Validation errors:', err.error.errors);
                        this.errorMessage += ' - ' + errorDetails;
                    }
                    this.cdr.detectChanges();

                    setTimeout(() => {
                        this.errorMessage = '';
                        this.cdr.detectChanges();
                    }, 2000);
                }
            });
        }
    }

    cancelForm() {
        if (this.isEditMode) {
            this.router.navigate(['/bookings/my-offered-rides']);
        } else {
            this.offerRideForm.reset();
        }
    }
}
