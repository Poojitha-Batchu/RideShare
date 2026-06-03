from django.db import models
from accounts.models import User
from rides.models import Ride
from bookings.models import Booking


class RideReview(models.Model):

    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name="review")
    ride = models.ForeignKey(Ride, on_delete=models.CASCADE, related_name="reviews")
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="given_reviews")
    driver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_reviews")
    rating = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "reviews"

    def __str__(self):
        return f"{self.reviewer.username} rated {self.driver.username}"
