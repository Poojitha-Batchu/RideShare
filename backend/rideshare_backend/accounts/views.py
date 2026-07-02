import logging
import os
from urllib import request

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import UserSerializer
from .storage import build_profile_image_name
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .utils import send_signup_mail, send_password_changed_mail
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.hashers import make_password

from django.db.models import Avg, Sum
from django.core.files.base import ContentFile
from django.conf import settings

logger = logging.getLogger('frontend_logs')
from bookings.models import Booking
from ride_review.models import RideReview
from rides.models import Ride

import threading


def upload_profile_image_to_storage(user, uploaded_file):
    if not uploaded_file:
        return None

    if not getattr(settings, 'USE_GCS_FOR_MEDIA', False):
        return None

    bucket_name = getattr(settings, 'GS_BUCKET_NAME', None)
    if not bucket_name:
        return None

    try:
        from google.cloud import storage
    except ImportError:
        return None

    file_name = build_profile_image_name(user.id, uploaded_file.name)
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(file_name)
    blob.upload_from_file(uploaded_file, content_type=uploaded_file.content_type)
    return blob.public_url


def send_mail_async(email, name):
    threading.Thread(
        target=send_signup_mail,
        args=(email, name)
    ).start()

def send_password_changed_mail_async(email, name):
    threading.Thread(
        target=send_password_changed_mail,
        args=(email, name)
    ).start()


# Endpoints for user signup
@api_view(["POST"])
@permission_classes([AllowAny])  # Allow unauthenticated access to this view
def signup(request):

    try:
        serializer = UserSerializer(data=request.data)

        if serializer.is_valid():
            user_data = serializer.validated_data
            serializer.save()

            send_mail_async(user_data["email"], user_data["full_name"])

            return Response(
                {
                    "success": True,
                    "message": "Signed up successfully. A confirmation mail has been sent to the registered email ID.",
                },
                status=201,
            )

        return Response(
            {
                "success": False,
                "message": "Signup failed. Please check the input fields.",
                "errors": serializer.errors,
            },
            status=400,
        )

    except Exception as e:
        return Response(
            {
                "success": False,
                "message": "Something went wrong during signup.",
                "error": str(e),
            },
            status=500,
        )


# Endpoints for user login
@api_view(["POST"])
@permission_classes([AllowAny])  # Allow unauthenticated access to this view
def login(request):

    email = request.data.get("email")
    password = request.data.get("password")

    try:
        user = User.objects.get(email=email)
        if check_password(password, user.password):
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "success": True,
                    "message": "Login successful. Redirecting to the home page.",
                    "access_token": str(refresh.access_token),
                    "refresh_token": str(refresh),
                    "user": {
                        "id": user.id,
                        "full_name": user.full_name,
                        "email": user.email,
                        "phone": user.phone,
                    },
                }
            )
        else:
            return Response(
                {"success": False, "message": "Invalid password"}, status=401
            )
    except User.DoesNotExist:
        return Response({"success": False, "message": "User not found"}, status=404)


# Endpoint for user logout
@api_view(["POST"])
@permission_classes(
    [IsAuthenticated]
)  # Only allow authenticated users to access this view
def logout(request):
    return Response({"message": "Logged out successfully"})


# Endpoint to get user profile details
@api_view(["GET"])
@permission_classes(
    [IsAuthenticated]
)  # Only allow authenticated users to access this view
def profile(request):
    try:
        user = request.user
        serializer = UserSerializer(user)

        total_rides = Ride.objects.filter(user=request.user, status='COMPLETED').count()

        # Total bookings
        total_bookings = Booking.objects.filter(passenger_id=request.user, booking_status = 'COMPLETED').count()

        total_earned = Booking.objects.filter(
            ride__user=request.user,
            booking_status="CONFIRMED",
            payment_status="PAID"
        ).aggregate(total=Sum("total_price"))["total"] or 0

        average_rating = RideReview.objects.filter(
            driver=request.user
        ).aggregate(avg=Avg("rating"))["avg"] or 0

        serializer_data = serializer.data
        serializer_data["total_offered_rides"] = total_rides
        serializer_data["total_my_bookings"] = total_bookings
        serializer_data["total_earned"] = total_earned
        serializer_data["average_rating"] = round(average_rating, 2)

        return Response(serializer_data, status=201)
    except Exception as e:
        return Response(
            {"error": "Something went wrong", "details": str(e)},
            status=500,
        )

# Update Profile
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_profile(request):

    try:
        user = request.user
        uploaded_file = request.FILES.get('profile_image')
        serializer_data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        cloud_url = None

        if uploaded_file:
            cloud_url = upload_profile_image_to_storage(user, uploaded_file)
            if cloud_url:
                serializer_data['profile_image'] = cloud_url
            else:
                serializer_data['profile_image'] = uploaded_file

        serializer = UserSerializer(user, data=serializer_data, partial=True)

        if serializer.is_valid():
            serializer.save()

            if cloud_url:
                user.profile_image = cloud_url
                user.save(update_fields=['profile_image'])

            return Response(
                {
                    "success": True,
                    "message": "Profile updated successfully",
                    "data": serializer.data,
                },
                status=200,
            )
        return Response(
            {
                "success": False,
                "message": "Failed to update profile. Please check the input fields.",
                "errors": serializer.errors,
            },
            status=400,
        )

    except Exception as e:
        return Response(
            {
                "success": False,
                "message": "Failed to update profile. Please try again.",
                "error": str(e),
            },
            status=500,
        )


@api_view(["POST"])
@permission_classes([AllowAny])
def frontend_logs(request):
    try:
        payload = request.data or {}
        level = payload.get('level', 'error')
        message = payload.get('message', 'Frontend log')
        details = payload.get('details', {})

        log_method = getattr(logger, level, logger.error)
        log_method(
            "Frontend log: %s | Details: %s | URL: %s",
            message,
            details,
            payload.get('url', ''),
        )

        return Response({"success": True, "message": "Log received"}, status=200)
    except Exception as exc:
        logger.exception("Failed to store frontend log: %s", exc)
        return Response({"success": False, "message": "Failed to store log"}, status=500)


@api_view(["POST"])
@permission_classes([AllowAny])
def forgot_password(request):

    email = request.data.get("email")
    password = request.data.get("password")
    confirm_password = request.data.get("confirm_password")

    try:
        user = User.objects.get(email=email)
        user.password = make_password(password)
        user.save()

        # Send mail
        send_password_changed_mail_async(user.email, user.full_name)
        return Response({"success": True, "message": "Password updated successfully"})

    except User.DoesNotExist:
        return Response({"success": False, "message": "User not found"}, status=404)
