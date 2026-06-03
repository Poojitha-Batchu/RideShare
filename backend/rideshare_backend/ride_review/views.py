from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import RideReview
from bookings.models import Booking

# Add a review for a completed ride
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_review(request):

    try:
        booking_id = request.data.get("booking_id")
        rating = request.data.get("rating")
        booking = Booking.objects.get(id=booking_id)
        existing_review = RideReview.objects.filter(booking=booking).first()

        # prevent duplicate reviews
        if RideReview.objects.filter(booking=booking).exists():

            return Response(
                {
                    "success": True,
                    "already_rated": True,
                    "message": "Already rated",
                    "rating": existing_review.rating,
                },
                status=200,
            )

        review = RideReview.objects.create(
            booking=booking,
            ride=booking.ride,
            reviewer=request.user,
            driver=booking.ride.user,
            rating=rating,
        )

        return Response(
            {
                "success": True,
                "already_rated": False,
                "message": "Review submitted successfully",
            }
        )

    except Exception as e:

        return Response(
            {"success": False, "message": "Failed to submit review", "error": str(e)},
            status=500,
        )

# Fetch existing review for a booking (if any)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_review(request, booking_id):

    try:
        review = RideReview.objects.filter(booking_id=booking_id).first()

        # REVIEW EXISTS
        if review:
            return Response(
                {"success": True, "already_rated": True, "rating": review.rating},
                status=200,
            )

        # NO REVIEW
        return Response(
            {"success": True, "already_rated": False, "rating": 0}, status=200
        )

    except Exception as e:
        return Response(
            {"success": False, "message": "Failed to fetch review", "error": str(e)},
            status=500,
        )
