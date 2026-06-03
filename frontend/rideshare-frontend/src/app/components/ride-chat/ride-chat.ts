import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService } from '../../services/chat';
import { Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-ride-chat',
    imports: [CommonModule, FormsModule],
    templateUrl: './ride-chat.html',
    styleUrl: './ride-chat.css'
})
export class RideChat implements OnInit, OnDestroy {
    messages: any[] = [];
    newMessage = '';
    chatActive = true;
    hasAccess = true;
    accessDeniedMessage = '';
    refreshInterval: any;
    isSending = false;
    currentUserId = Number(localStorage.getItem('user_id'));

    @Input() rideId!: number;
    @Input() bookingId?: number;

    @Input() pickupLocation!: string;
    @Input() dropLocation!: string;
    @Output() close = new EventEmitter<void>();

    constructor(
        private route: ActivatedRoute,
        private chatService: ChatService,
        private cdr: ChangeDetectorRef,
    ) { }

    ngOnInit(): void {
        // LOAD MESSAGES IMMEDIATELY
        this.loadMessages();

        // SETUP INTERVAL TO REFRESH MESSAGES EVERY 1.5 SECONDS
        this.refreshInterval = setInterval(() => {
            this.loadMessages();
        }, 1500);
    }

    // OPTIMIZE TO ONLY FETCH NEW MESSAGES INSTEAD OF ALL MESSAGES EVERY TIME
    loadMessages() {
        this.chatService.getMessages(this.rideId, this.bookingId).subscribe({
            next: (res: any) => {
                console.log('Fetched messages:', res);
                this.hasAccess = res.has_access;
                this.messages = res.messages || [];
                this.chatActive = res.chat_active;

                this.cdr.detectChanges();
            },

            error: (err) => {

                if (err.status === 403) {

                    this.hasAccess = false;

                    this.accessDeniedMessage =
                        err.error?.message ||
                        "Access denied";

                    if (this.refreshInterval) {
                        clearInterval(this.refreshInterval);
                        this.refreshInterval = null;
                    }
                }

                this.cdr.detectChanges();
            }
        });
    }

    // OPTIMISTIC UI UPDATE: ADD MESSAGE TO UI IMMEDIATELY, THEN SEND TO SERVER
    sendMessage() {
        const message = this.newMessage.trim();
        if (!message || this.isSending) return;
        this.isSending = true;

        // this.messages.push(tempMessage);
        this.cdr.detectChanges();

        // CLEAR INPUT IMMEDIATELY
        this.newMessage = '';
        console.log('Sending message:', message);

        this.chatService.sendMessage(this.rideId, message).subscribe({
            next: () => {
                console.log('Message sent successfully');

                this.isSending = false;

                // REFRESH ACTUAL MESSAGES
                this.loadMessages();
                this.cdr.detectChanges();
            },

            error: (err) => {
                console.error(err);

                this.isSending = false;
                this.cdr.detectChanges();
            }
        });
    }

    closeChat() {
        this.close.emit();
    }

    ngOnDestroy(): void {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }
}