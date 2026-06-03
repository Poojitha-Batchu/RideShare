import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../components/navbar/navbar';
import { Router, RouterModule } from '@angular/router';
import { Features } from '../../components/features/features';
import { HowItWorks } from '../../components/how-it-works/how-it-works';
import { HeroSection } from '../../components/hero-section/hero-section';
import { Footer } from '../../components/footer/footer';

@Component({
    selector: 'app-home-page',
    imports: [Navbar, Features, HeroSection, HowItWorks, Footer, CommonModule, RouterModule],
    templateUrl: './home-page.html',
    styleUrl: './home-page.css',
})
export class HomePage implements OnInit {

    constructor(private router: Router) { }

    ngOnInit(): void {
        const token = localStorage.getItem('access_token');

        // If logged in
        if (token) {
            this.router.navigate(['/dashboard']);
        }
    }
}
