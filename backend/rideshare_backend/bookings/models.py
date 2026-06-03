from django.db import models
from accounts.models import User
from rides.models import Ride

# Create your models here.
class Booking(models.Model):

    PAYMENT_CHOICES = (
        ('UPI', 'UPI'),
        ('CARD', 'CARD'),
        ('CASH', 'CASH'),
    )

    PAYMENT_STATUS_CHOICES = (
        ('PENDING', 'PENDING'),
        ('PAID', 'PAID'),
    )

    BOOKING_STATUS_CHOICES = (
        ('CONFIRMED', 'CONFIRMED'),
        ('CANCELLED', 'CANCELLED'),
        ('COMPLETED', 'COMPLETED'),
    )

    ride = models.ForeignKey(
        Ride,
        on_delete=models.CASCADE,
        related_name='bookings'
    )

    passenger = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='my_bookings'
    )

    seats_booked = models.PositiveIntegerField(default=0)

    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_CHOICES
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='PENDING'
    )

    booking_status = models.CharField(
        max_length=20,
        choices=BOOKING_STATUS_CHOICES,
        default='CONFIRMED'
    )

    booked_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bookings'
        ordering = ['-booked_at']

    def __str__(self):
        return f'Booking {self.id} for Ride {self.ride.id} by {self.passenger.username}'