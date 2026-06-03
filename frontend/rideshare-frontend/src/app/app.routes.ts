import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { SignupPage } from './pages/signup-page/signup-page';
import { LoginPage } from './pages/login-page/login-page';
import { DashboardPage } from './pages/dashboard-page/dashboard-page';
import { ProfilePage } from './pages/profile-page/profile-page';
import { ForgotPasswordPage } from './pages/forgot-password-page/forgot-password-page';
import { OfferRide } from './pages/offer-ride/offer-ride';
import { authGuard } from './guards/auth-guard';
import { FindRides } from './pages/find-rides/find-rides';
import { MyRides } from './pages/my-rides/my-rides';
import { MyBookings } from './components/my-bookings/my-bookings';
import { MyOfferedRides } from './components/my-offered-rides/my-offered-rides';
import { About } from './pages/about/about';

export const routes: Routes = [
    { path: '', component: HomePage },
    { path: 'signup', component: SignupPage },
    { path: 'login', component: LoginPage },
    { path: 'forgot-password', component: ForgotPasswordPage },
    { path: 'dashboard', component: DashboardPage, canActivate: [authGuard] },
    { path: 'profile', component: ProfilePage, canActivate: [authGuard] },
    { path: 'rides/offer-ride', component: OfferRide, canActivate: [authGuard] },
    { path: 'rides/search-ride', component: FindRides, canActivate: [authGuard] },
    { path: 'bookings', component: MyRides, canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'my-bookings', pathMatch: 'full' },
            { path: 'my-bookings', component: MyBookings, canActivate: [authGuard] },
            { path: 'my-offered-rides', component: MyOfferedRides, canActivate: [authGuard] },
        ]
    },
    { path: 'about', component: About }
];
