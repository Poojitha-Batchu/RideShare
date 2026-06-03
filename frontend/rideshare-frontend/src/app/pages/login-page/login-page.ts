import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Authentication } from '../../services/authentication';

import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Message } from '../../components/message/message';

@Component({
    selector: 'app-login-page',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, RouterModule, Message],
    templateUrl: './login-page.html',
    styleUrl: './login-page.css',
})
export class LoginPage {
    loginForm!: FormGroup;
    loginErrorMessage: string = '';
    loginSuccessMessage: string = '';

    constructor(private fb: FormBuilder, private authService: Authentication, private router: Router, private cdr: ChangeDetectorRef) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required]],
        });
    }

    onLogin() {
        this.loginErrorMessage = '';
        this.loginSuccessMessage = '';

        if (this.loginForm.valid) {
            this.authService.login(this.loginForm.value).subscribe({
                next: (res: any) => {
                    // console.log("Login successful", res);

                    // ✅ Store tokens
                    localStorage.setItem('access_token', res.access_token);
                    localStorage.setItem('refresh_token', res.refresh_token);

                    // ✅ Store user info
                    localStorage.setItem('user', JSON.stringify(res.user));

                    this.loginSuccessMessage = res.message;
                    this.cdr.detectChanges();

                    this.loginForm.reset();

                    setTimeout(() => {
                        this.loginSuccessMessage = '';
                        this.cdr.detectChanges();
                        this.router.navigate(['/dashboard']);
                    }, 2000);

                },
                error: (err) => {
                    // console.log("Login error", err);
                    // ✅ Backend message
                    this.loginErrorMessage = err.error.message;
                    this.cdr.detectChanges();

                    // Clear error message after 2 seconds
                    setTimeout(() => {
                        this.loginErrorMessage = '';
                        this.cdr.detectChanges();
                    }, 2000);
                }
            });
        } else {
            // console.log('Form Invalid');
            this.loginErrorMessage = 'Please enter valid credentials';
            this.cdr.detectChanges();

            // Clear error message after 2 seconds
            setTimeout(() => {
                this.loginErrorMessage = '';
                this.cdr.detectChanges();
            }, 2000);
        }
    }
}
