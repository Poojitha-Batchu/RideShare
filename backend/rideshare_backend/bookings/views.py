from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction

from rides.serializers import RideSerializer
from rides.models import Ride
from .models import Booking


# ====== to book a ride ======
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def book_ride(request):

    try:
        # Get and validate required fields
        ride_id = request.data.get("ride_id")
        if not ride_id:
            return Response(
                {"success": False, "message": "ride_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if user already has a confirmed booking for this ride
        existing_booking = Booking.objects.filter(
            ride=ride_id,
            passenger=request.user,
            booking_status="CONFIRMED"
        ).exists()

        if existing_booking:
            return Response(
                {
                    "success": False,
                    "message": "You have already booked this ride"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        seats_booked_raw = request.data.get("seats_booked")
        if not seats_booked_raw:
            return Response(
                {"success": False, "message": "seats_booked is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment_method = request.data.get("payment_method")
        if not payment_method:
            return Response(
                {"success": False, "message": "payment_method is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Convert to integer safely
        seats_booked = int(seats_booked_raw)

        # Validate seats
        if seats_booked <= 0:
            return Response(
                {
                    "success": False,
                    "message": "Seats should be greater than 0",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate payment method
        valid_payment_methods = Booking.PAYMENT_CHOICES
        valid_payment_methods = [method[0] for method in valid_payment_methods]

        if payment_method not in valid_payment_methods:
            return Response(
                {
                    "success": False,
                    "message": "Invalid payment method",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get Ride
        ride = Ride.objects.get(id=ride_id)

        # Check ride status
        if ride.status in ["FULL", "CANCELLED", "COMPLETED"]:
            return Response(
                {
                    "success": False,
                    "message": f"Ride is {ride.status.lower()}",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check available seats
        if ride.available_seats < seats_booked:
            return Response(
                {
                    "success": False,
                    "message": f"Only {ride.available_seats} seats available",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Decrease seats
        ride.available_seats -= seats_booked
        ride.save()

        # Payment status - always PENDING
        payment_status = "PENDING"

        # Create Booking
        try:
            booking = Booking.objects.create(
                ride=ride,
                passenger=request.user,
                seats_booked=seats_booked,
                total_price=ride.price_per_seat * seats_booked,
                payment_method=payment_method,
                payment_status=payment_status,
                booking_status="CONFIRMED",
            )
        except Exception as booking_error:
            # Rollback ride seat changes if booking creation fails
            ride.available_seats += seats_booked
            ride.status = "ACTIVE" if ride.available_seats > 0 else "FULL"
            ride.save()
            raise booking_error

        return Response(
            {
                "success": True,
                "message": "Ride booked successfully",
                "data": {
                    "booking_id": booking.id,
                    "ride_id": ride.id,
                    "remaining_seats": ride.available_seats,
                    "payment_method": booking.payment_method,
                    "payment_status": booking.payment_status,
                },
            },
            status=status.HTTP_201_CREATED,
        )

    except Ride.DoesNotExist:
        return Response(
            {
                "success": False,
                "message": "Ride not found",
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    except ValueError:
        return Response(
            {
                "success": False,
                "message": "Invalid seats value",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    except Exception as e:
        return Response(
            {
                "success": False,
                "message": "Something went wrong while booking ride",
                "error": str(e),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# ====== to get my bookings ======
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_bookings(request):

    try:

        bookings = Booking.objects.filter(passenger_id=request.user).select_related(
            "ride", "ride__user"
        )

        data = []

        for booking in bookings:
            ride = booking.ride

            serializer = RideSerializer(
                ride,
                context={"request": request}
            )

            ride_data = serializer.data

            total_pay = booking.seats_booked * ride.price_per_seat

            data.append(
                {
                    "booking_id": booking.id,
                    "driver_name": ride.user.full_name,
                    "driver_image": (
                        request.build_absolute_uri(ride.user.profile_image)
                        if ride.user.profile_image and ride.user.profile_image.startswith('/media/')
                        else None
                    ),
                    "driver_rating": ride_data["average_rating"],
                    "pickup_location": ride.pickup_location,
                    "pickup_landmark": ride.pickup_landmark,
                    "drop_location": ride.drop_location,
                    "drop_landmark": ride.drop_landmark,
                    "pickup_date": ride.pickup_date,
                    "pickup_time": ride.pickup_time,
                    "payment_method": booking.payment_method,
                    "payment_status": booking.payment_status,
                    "price_per_seat": ride.price_per_seat,
                    "seats_booked": booking.seats_booked,
                    "booking_status": booking.booking_status,
                    "ride_status": ride.status,
                    "ride_id": ride.id,
                    "total_pay": total_pay,
                }
            )

        return Response({"success": True, "data": data})

    except Exception as e:
        return Response(
            {"success": False, "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# ===== to cancel a booking ======
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cancel_booking(request):

    try:
        booking_id = request.data.get("booking_id")
        cancel_seats = int(request.data.get("cancel_seats", 1))

        booking = Booking.objects.select_related("ride").get(
            id=booking_id, passenger=request.user
        )

        # ALREADY CANCELLED
        if booking.booking_status == "CANCELLED":
            return Response(
                {"success": False, "message": "Booking already cancelled"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # INVALID SEAT COUNT
        if cancel_seats <= 0:
            return Response(
                {"success": False, "message": "Invalid seat count"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # MORE THAN BOOKED
        if cancel_seats > booking.seats_booked:
            return Response(
                {
                    "success": False,
                    "message": f"You only booked {booking.seats_booked} seat(s)",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        ride = booking.ride

        # FULL BOOKING CANCEL
        if cancel_seats == booking.seats_booked:
            ride.available_seats += booking.seats_booked
            ride.status = "ACTIVE" if ride.available_seats > 0 else "FULL"
            ride.save()
            booking.booking_status = "CANCELLED"
            booking.seats_booked = 0
            booking.save()

            return Response(
                {
                    "success": True,
                    "message": "Booking cancelled successfully",
                    "data": {"booking_cancelled": True},
                },
                status=status.HTTP_200_OK,
            )

        # PARTIAL CANCELLATION
        booking.seats_booked -= cancel_seats
        ride.available_seats += cancel_seats
        booking.save()
        ride.save()
        return Response(
            {
                "success": True,
                "message": "Seats cancelled successfully",
                "data": {
                    "booking_cancelled": False,
                    "remaining_booked_seats": booking.seats_booked,
                },
            },
            status=status.HTTP_200_OK,
        )

    except Booking.DoesNotExist:
        return Response(
            {"success": False, "message": "Booking not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    except ValueError:
        return Response(
            {"success": False, "message": "Invalid cancel seats value"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    except Exception as e:
        return Response(
            {"success": False, "message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# ==== to get rides offered by me ======
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_offered_rides(request):

    try:
        rides = Ride.objects.filter(user=request.user).order_by("-created_at")

        data = []
        for ride in rides:
            try:

                confirmed_bookings = Booking.objects.filter(
                    ride=ride, booking_status="CONFIRMED"
                ).select_related("passenger")

                passengers = []

                total_booked_seats = 0
                total_earned = 0

                for booking in confirmed_bookings:
                    try:
                        total_booked_seats += booking.seats_booked

                        # Add amount only if payment is PAID
                        if booking.payment_status == "PAID":
                            total_earned += booking.seats_booked * ride.price_per_seat

                        passengers.append(
                            {
                                "booking_id": booking.id,
                                "passenger_name": booking.passenger.full_name,
                                "payment_method": booking.payment_method,
                                "payment_status": booking.payment_status,
                                "seats_booked": booking.seats_booked,
                                "total_price": booking.seats_booked * ride.price_per_seat,
                            }
                        )

                    except Exception as booking_error:
                        print("Passenger Error:", str(booking_error))

                data.append(
                    {
                        "ride_id": ride.id,
                        "pickup_location": ride.pickup_location,
                        "pickup_landmark": ride.pickup_landmark,
                        "drop_location": ride.drop_location,
                        "drop_landmark": ride.drop_landmark,
                        "pickup_date": ride.pickup_date,
                        "pickup_time": ride.pickup_time,
                        "vehicle_name": ride.vehicle_name,
                        "vehicle_number": ride.vehicle_number,
                        "price_per_seat": ride.price_per_seat,
                        "available_seats": ride.available_seats,
                        "status": ride.status,
                        "description": ride.description,
                        "booked_seats": total_booked_seats,
                        "total_seats": total_booked_seats + ride.available_seats,
                        "total_earned": total_earned,
                        "passengers": passengers,
                    }
                )

            except Exception as ride_error:
                print("Ride Error:", str(ride_error))
        return Response({"success": True, "data": data})

    except Exception as e:
        return Response({"success": False, "message": str(e)}, status=500)

# ==== to mark payment as paid by passenger ======
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def mark_payment_paid(request, booking_id):

    try:
        booking = Booking.objects.get(id=booking_id)

        # Only passenger can update payment
        if booking.passenger != request.user:
            return Response(
                {"success": False, "message": "Unauthorized"},
                status=status.HTTP_403_FORBIDDEN,
            )

        booking.payment_status = "PAID"
        booking.save()

        return Response(
            {"success": True, "message": "Payment completed successfully"},
            status=status.HTTP_200_OK,
        )

    except Booking.DoesNotExist:
        return Response(
            {"success": False, "message": "Booking not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    except Exception as e:

        return Response(
            {"success": False, "message": "Something went wrong", "error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# ======= to cancel a ride ======
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cancel_ride(request):

    try:

        ride_id = request.data.get("ride_id")

        if not ride_id:
            return Response(
                {"success": False, "message": "Ride ID required"}, status=400
            )

        try:
            ride = Ride.objects.get(id=ride_id, user=request.user)

        except Ride.DoesNotExist:
            return Response({"success": False, "message": "Ride not found"}, status=404)

        # UPDATE RIDE STATUS
        ride.status = "CANCELLED"
        ride.save()

        return Response({"success": True, "message": "Ride cancelled successfully"})

    except Exception as e:
        return Response({"success": False, "message": str(e)}, status=500)
