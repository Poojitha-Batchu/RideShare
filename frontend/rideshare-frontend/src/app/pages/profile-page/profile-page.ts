import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Authentication } from '../../services/authentication';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { Message } from '../../components/message/message';
import { AppLogger } from '../../services/app-logger';
import { buildProfileImageUrl } from '../../services/profile-image-url';

@Component({
    selector: 'app-profile-page',
    imports: [CommonModule, ReactiveFormsModule, Navbar, Message],
    templateUrl: './profile-page.html',
    styleUrl: './profile-page.css',
})
export class ProfilePage implements OnInit {
    userData: any = {};
    showEditForm: boolean = false;
    profileForm!: FormGroup;
    selectedImage: any;
    successMessage: string = '';
    errorMessage: string = '';
    today: string = new Date().toISOString().split('T')[0];

    constructor(
        private http: HttpClient,
        private authService: Authentication,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef,
    ) {
        this.profileForm = this.fb.group({
            full_name: '',
            email: { value: '', disabled: true },
            phone: '',
            gender: '',
            date_of_birth: '',
            profile_image: '',
        });
    }

    ngOnInit(): void {
        this.getProfile();
    }

    openEditForm() {
        this.showEditForm = true;

        this.profileForm.patchValue({
            full_name: this.userData.full_name,
            email: this.userData.email,
            phone: this.userData.phone,
            gender: this.userData.gender,
            date_of_birth: this.userData.date_of_birth,
        });
    }

    closeEditForm() {
        this.showEditForm = false;
    }

    onImageSelect(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedImage = file;
        }
    }

    onImageError(event: any) {
        this.userData.profile_image = '';
        this.cdr.detectChanges();
    }

    getProfile() {
        return this.authService.get_profile_details().subscribe({
            next: (response: any) => {
                AppLogger.debug('Profile response:', response);
                this.userData = response;

                this.userData.profile_image = buildProfileImageUrl(this.userData.profile_image);

                // console.log('Image URL:', this.userData.profile_image);
                this.cdr.detectChanges();
            },

            error: (error) => {
                // console.log('Error fetching profile:', error);
                this.errorMessage = error.error.message;

                // Clear error message after 2 seconds
                setTimeout(() => {
                    this.errorMessage = '';
                    this.cdr.detectChanges();
                }, 2000);
            },
        });
    }

    saveProfile() {
        let updateData: any;

        // If image is selected, use FormData for file upload
        if (this.selectedImage) {
            updateData = new FormData();

            if (this.profileForm.value.full_name) {
                updateData.append('full_name', this.profileForm.value.full_name);
            }
            if (this.profileForm.value.email) {
                updateData.append('email', this.profileForm.value.email);
            }
            if (this.profileForm.value.phone) {
                updateData.append('phone', this.profileForm.value.phone);
            }
            if (this.profileForm.value.gender) {
                updateData.append('gender', this.profileForm.value.gender);
            }
            if (this.profileForm.value.date_of_birth) {
                updateData.append('date_of_birth', this.profileForm.value.date_of_birth);
            }

            // Append the image file
            updateData.append('profile_image', this.selectedImage);
        } else {
            // If no image, send as JSON
            updateData = {};

            if (this.profileForm.value.full_name) {
                updateData.full_name = this.profileForm.value.full_name;
            }
            if (this.profileForm.value.email) {
                updateData.email = this.profileForm.value.email;
            }
            if (this.profileForm.value.phone) {
                updateData.phone = this.profileForm.value.phone;
            }
            if (this.profileForm.value.gender) {
                updateData.gender = this.profileForm.value.gender;
            }
            if (this.profileForm.value.date_of_birth) {
                updateData.date_of_birth = this.profileForm.value.date_of_birth;
            }
        }

        // console.log('Sending update data:', updateData);

        return this.authService.update_profile(updateData).subscribe({
            next: (response: any) => {
                // console.log('Response:', response);

                this.successMessage = response.message;

                // Clear success message after 2 seconds
                setTimeout(() => {
                    this.successMessage = '';
                    this.cdr.detectChanges();
                }, 2000);

                // Update profile card instantly
                this.userData = {
                    ...response.data,
                };

                this.userData.profile_image = buildProfileImageUrl(this.userData.profile_image);

                // Update localStorage with new user data
                localStorage.setItem('user', JSON.stringify(this.userData));

                // Broadcast user data change to other components
                this.authService.userDataChanged.next(this.userData);

                // Close form
                this.showEditForm = false;

                // Reset image
                this.selectedImage = null;

                // Force UI refresh
                this.cdr.detectChanges();
            },

            error: (error) => {
                // console.log('Error:', error);
                this.errorMessage = error.error.message;

                // Clear error message after 2 seconds
                setTimeout(() => {
                    this.errorMessage = '';
                    this.cdr.detectChanges();
                }, 2000);
            },
        });
    }
}
