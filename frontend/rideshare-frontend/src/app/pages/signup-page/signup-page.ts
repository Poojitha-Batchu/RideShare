import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Authentication } from '../../services/authentication';
import { Message } from '../../components/message/message';

@Component({
    selector: 'app-signup-page',
    imports: [ReactiveFormsModule, CommonModule, RouterModule, Message],
    templateUrl: './signup-page.html',
    styleUrl: './signup-page.css',
})

export class SignupPage {
    signupForm!: FormGroup;
    signupErrorMessage: string = '';
    signupSuccessMessage: string = '';

    constructor(private fb: FormBuilder, private authService: Authentication, private router: Router, private cdr: ChangeDetectorRef) {
        this.signupForm = this.fb.group({
            full_name: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
            password: [
                '',
                [
                    Validators.required,
                    Validators.minLength(8),
                    Validators.pattern('^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).*$'),
                ],
            ],
            confirmPassword: ['', [Validators.required]],
        }, { validators: this.passwordMatchValidator });
    }

    // Custom validator to check if password and confirmPassword match
    passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const password = control.get('password')?.value;
        const confirmPassword = control.get('confirmPassword')?.value;

        if (!password || !confirmPassword) {
            return null;
        }

        return password === confirmPassword ? null : { passwordMismatch: true };
    }

    onSignup() {
        // console.log("Signup form submitted", this.signupForm.value);

        this.signupErrorMessage = '';
        this.signupSuccessMessage = '';

        if (this.signupForm.valid) {
            this.authService.signup(this.signupForm.value).subscribe({
                next: (res: any) => {
                    // console.log("Signup successful", res);
                    this.signupSuccessMessage = res.message;
                    this.cdr.detectChanges();
                    this.signupForm.reset();

                    setTimeout(() => {
                        this.signupSuccessMessage = '';
                        this.cdr.detectChanges();
                        this.router.navigate(['/login']);
                    }, 2000);
                },
                error: (err: any) => {
                    this.signupErrorMessage = err.error.message;
                    this.cdr.detectChanges();
                    // console.log("Error", err);

                    // Clear error message after 2 seconds
                    setTimeout(() => {
                        this.signupErrorMessage = '';
                        this.cdr.detectChanges();
                    }, 2000);
                }
            });
        } else {
            this.signupErrorMessage = 'An error occurred during signup. Please try again.';
            this.cdr.detectChanges();
            // console.log('Form is invalid');

            // Clear error message after 2 seconds
            setTimeout(() => {
                this.signupErrorMessage = '';
                this.cdr.detectChanges();
            }, 2000);
        }
    }
}
