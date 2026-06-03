import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';


export const authGuard: CanActivateFn = (route, state) => {

    const router = inject(Router);
    const token = localStorage.getItem('access_token');

    // If token exists
    if (token) {
        return true;
    }

    // Redirect to login
    router.navigate(['/login']);
    return false;
};
