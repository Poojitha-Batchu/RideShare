import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../components/navbar/navbar';
import { Rides } from '../../services/rides';
import { Message } from '../../components/message/message';
import { RideDetailsCard } from '../../components/ride-details-card/ride-details-card';

@Component({
    selector: 'app-find-rides',
    imports: [CommonModule, Navbar, ReactiveFormsModule, Message, RideDetailsCard],
    templateUrl: './find-rides.html',
    styleUrl: './find-rides.css',
})
export class FindRides implements OnInit {
    searchRideForm!: FormGroup;
    rides: any[] = [];
    successMessage: string = '';
    errorMessage: string = '';

    allPickupLocations: string[] = [];
    allDropLocations: string[] = [];
    allPickupTimes: string[] = [];
    allPrices: string[] = [];

    filteredPickupLocations: string[] = [];
    filteredDropLocations: string[] = [];
    filteredPickupTimes: string[] = [];
    filteredPrices: string[] = [];

    // Track focus state for dropdowns
    focusedField: string = '';

    constructor(private fb: FormBuilder, private rideService: Rides, private cdr: ChangeDetectorRef) {
        this.searchRideForm = this.fb.group({
            pickup_location: ['', Validators.required],
            drop_location: ['', Validators.required],
            pickup_date: [''],
            pickup_time: [''],
            price_per_seat: [''],
        });
    }

    ngOnInit() {
        this.loadAllRides();
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {

        const target = event.target as HTMLElement;
        const clickedInsideDropdown = target.closest('.dropdown-group');

        if (!clickedInsideDropdown) {
            this.focusedField = '';
        }
    }

    loadAllRides() {
        this.rideService.getRides().subscribe({
            next: (res: any) => {
                if (res.data && res.data.length > 0) {
                    this.populateDropdownOptions(res.data);
                }
            },
            error: (err: any) => {
                console.log('Error loading rides:', err);
            }
        });
    }

    formatTimeToAmPm(time: string): string {
        if (!time) return time;
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const minute = minutes;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minute} ${ampm}`;
    }

    populateDropdownOptions(rides: any[]) {
        // Extract unique values from current rides
        const pickupLocations = [...new Set(rides.map((ride: any) => ride.pickup_location as string))];
        const dropLocations = [...new Set(rides.map((ride: any) => ride.drop_location as string))];
        const pickupTimes = [...new Set(rides.map((ride: any) => this.formatTimeToAmPm(ride.pickup_time as string)))];
        const prices = [...new Set(rides.map((ride: any) => ride.price_per_seat.toString()))];

        // Update all options
        this.allPickupLocations = pickupLocations as string[];
        this.allDropLocations = dropLocations as string[];
        this.allPickupTimes = pickupTimes as string[];
        this.allPrices = prices as string[];

        // Reset filtered arrays to show all unique options
        this.filteredPickupLocations = this.allPickupLocations;
        this.filteredDropLocations = this.allDropLocations;
        this.filteredPickupTimes = this.allPickupTimes;
        this.filteredPrices = this.allPrices;
    }

    filterPickup() {
        const value = this.searchRideForm.value.pickup_location?.toLowerCase() || '';
        this.filteredPickupLocations = this.allPickupLocations.filter(item => item.toLowerCase().includes(value));
    }

    filterDrop() {
        const value = this.searchRideForm.value.drop_location?.toLowerCase() || '';
        this.filteredDropLocations = this.allDropLocations.filter(item => item.toLowerCase().includes(value));
    }

    filterTime() {
        const value = this.searchRideForm.value.pickup_time?.toLowerCase() || '';
        this.filteredPickupTimes = this.allPickupTimes.filter(item => item.toLowerCase().includes(value));
    }

    filterPrice() {
        const value = this.searchRideForm.value.price_per_seat?.toString()?.toLowerCase() || '';
        this.filteredPrices = this.allPrices.filter(item => item.toLowerCase().includes(value));
    }

    onPickupFocus() {
        this.focusedField = 'pickup_location';
        this.filterPickup();
    }

    onDropFocus() {
        this.focusedField = 'drop_location';
        this.filterDrop();
    }

    onTimeFocus() {
        this.focusedField = 'pickup_time';
        this.filterTime();
    }

    onPriceFocus() {
        this.focusedField = 'price_per_seat';
        this.filterPrice();
    }

    selectPickup(value: string) {
        this.searchRideForm.patchValue({ pickup_location: value });
        this.filteredPickupLocations = [];
        this.focusedField = '';
    }

    selectDrop(value: string) {
        this.searchRideForm.patchValue({ drop_location: value });
        this.filteredDropLocations = [];
        this.focusedField = '';
    }

    selectTime(value: string) {
        this.searchRideForm.patchValue({ pickup_time: value });
        this.filteredPickupTimes = [];
        this.focusedField = '';
    }

    selectPrice(value: string) {
        this.searchRideForm.patchValue({ price_per_seat: value });
        this.filteredPrices = [];
        this.focusedField = '';
    }

    searchRides() {
        this.errorMessage = '';
        this.successMessage = '';
        this.focusedField = '';

        // Reset rides and filters
        this.rides = [];
        this.filteredPickupLocations = [];
        this.filteredDropLocations = [];
        this.filteredPickupTimes = [];
        this.filteredPrices = [];

        this.rideService.searchRides(this.searchRideForm.value).subscribe({
            next: (res: any) => {
                console.log(res);

                if (res.data && res.data.length > 0) {
                    this.rides = res.data;
                    // Update dropdown options with search results
                    this.populateDropdownOptions(res.data);
                } else {
                    this.rides = [];
                    // Clear dropdown options when no results found
                    this.allPickupLocations = [];
                    this.allDropLocations = [];
                    this.allPickupTimes = [];
                    this.allPrices = [];
                    this.filteredPickupLocations = [];
                    this.filteredDropLocations = [];
                    this.filteredPickupTimes = [];
                    this.filteredPrices = [];
                }
                // Force change detection to update UI
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                // this.ngZone.run(() => {
                console.log(err);
                this.rides = [];
                this.errorMessage = err.error?.message || 'Error searching rides';

                // Wait 2 seconds
                setTimeout(() => {
                    this.clearSearch();
                }, 2000);

                // Clear dropdown options on error
                this.allPickupLocations = [];
                this.allDropLocations = [];
                this.allPickupTimes = [];
                this.allPrices = [];
                this.filteredPickupLocations = [];
                this.filteredDropLocations = [];
                this.filteredPickupTimes = [];
                this.filteredPrices = [];

                // Force change detection to update UI
                this.cdr.detectChanges();
                // });
            }
        });
    }

    clearSearch() {
        // Reset form
        this.searchRideForm.reset();

        // Clear all state
        this.rides = [];
        this.errorMessage = '';
        this.successMessage = '';
        this.focusedField = '';

        // Clear all dropdown data
        this.allPickupLocations = [];
        this.allDropLocations = [];
        this.allPickupTimes = [];
        this.allPrices = [];
        this.filteredPickupLocations = [];
        this.filteredDropLocations = [];
        this.filteredPickupTimes = [];
        this.filteredPrices = [];

        // Load all rides again to populate initial dropdowns
        this.loadAllRides();

        // Force change detection to update UI
        this.cdr.detectChanges();
    }
}
