from django.db import models
from accounts.models import User


class Ride(models.Model):

    RIDE_STATUS_CHOICES = [
        ("ACTIVE", "Active"),
        ("STARTED", "Started"),
        ("COMPLETED", "Completed"),
        ("CANCELLED", "Cancelled"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="rides")

    # Ride Details
    pickup_location = models.CharField(max_length=255)
    pickup_landmark = models.CharField(max_length=255, blank=True, null=True)

    drop_location = models.CharField(max_length=255)
    drop_landmark = models.CharField(max_length=255, blank=True, null=True)

    pickup_date = models.DateField()
    pickup_time = models.TimeField()

    # Vehicle Details
    vehicle_name = models.CharField(max_length=100)
    vehicle_number = models.CharField(max_length=20)

    # Ride Information
    available_seats = models.PositiveIntegerField()
    price_per_seat = models.DecimalField(max_digits=10, decimal_places=2)

    description = models.TextField(blank=True, null=True)

    status = models.CharField(max_length=20, choices=RIDE_STATUS_CHOICES, default="ACTIVE")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'rides'

    def __str__(self):
        return f"{self.pickup_location} → {self.drop_location}"
