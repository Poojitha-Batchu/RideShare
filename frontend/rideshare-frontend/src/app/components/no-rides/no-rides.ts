import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-no-rides',
    imports: [],
    templateUrl: './no-rides.html',
    styleUrl: './no-rides.css',
})
export class NoRides {
    @Input() message: string = '';
    @Input() subMessage: string = '';
}
