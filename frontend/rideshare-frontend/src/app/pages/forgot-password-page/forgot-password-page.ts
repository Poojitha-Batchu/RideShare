import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Authentication } from '../../services/authentication';
import { Router } from '@angular/router';
import { Message } from '../../components/message/message';

@Component({
    selector: 'app-forgot-password-page',
    imports: [CommonModule, ReactiveFormsModule, Message],
    templateUrl: './forgot-password-page.html',
    styleUrl: './forgot-password-page.css',
})
export class ForgotPasswordPage {
    forgotPasswordForm!: FormGroup;

    forgotPasswordErrorMessage = '';
    forgotPasswordSuccessMessage = '';

    constructor(
        private fb: FormBuilder,
        private authService: Authentication,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {
        this.forgotPasswordForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: [
                '',
                [
                    Validators.required,
                    Validators.minLength(8),
                    Validators.pattern('^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).*$'),
                ],
            ],
            confirm_password: ['', Validators.required],
        });
    }

    resetPassword() {
        this.forgotPasswordErrorMessage = '';
        this.forgotPasswordSuccessMessage = '';

        if (this.forgotPasswordForm.value.password !== this.forgotPasswordForm.value.confirm_password) {
            this.forgotPasswordErrorMessage = 'Passwords do not match';
            this.cdr.detectChanges();

            // Clear error message after 2 seconds
            setTimeout(() => {
                this.forgotPasswordErrorMessage = '';
                this.cdr.detectChanges();
            }, 2000);
            return;
        }

        if (this.forgotPasswordForm.valid) {
            this.authService.forgot_password(this.forgotPasswordForm.value).subscribe({
                next: (res: any) => {
                    // alert(res.message);
                    this.forgotPasswordSuccessMessage = res.message;
                    this.cdr.detectChanges();
                    this.forgotPasswordForm.reset();

                    setTimeout(() => {
                        this.forgotPasswordSuccessMessage = '';
                        this.cdr.detectChanges();
                        this.router.navigate(['/login']);
                    }, 2000);
                },

                error: (err) => {
                    // ✅ Backend message
                    this.forgotPasswordErrorMessage = err.error.message;
                    this.cdr.detectChanges();

                    // Clear error message after 2 seconds
                    setTimeout(() => {
                        this.forgotPasswordErrorMessage = '';
                        this.cdr.detectChanges();
                    }, 2000);
                },
            });
        } else {
            this.forgotPasswordErrorMessage = 'Please fill all fields correctly';
            this.cdr.detectChanges();

            // Clear error message after 2 seconds
            setTimeout(() => {
                this.forgotPasswordErrorMessage = '';
                this.cdr.detectChanges();
            }, 2000);
        }
    }
}
