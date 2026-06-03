import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-message',
  imports: [CommonModule],
  templateUrl: './message.html',
  styleUrl: './message.css',
})
export class Message {
  @Input()
  successMessage: string  ='';

  @Input()
  errorMessage: string  = '';
}
