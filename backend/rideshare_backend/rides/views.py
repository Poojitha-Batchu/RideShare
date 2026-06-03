from datetime import timedelta

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils import timezone

from .models import Ride
from .serializers import RideSerializer
from chat.models import RideChatRoom

# Get All Rides
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_all_rides(request):

    local_now = timezone.localtime()

    today = local_now.date()
    current_time = local_now.time()

    print(f"Today's Date: {today}, Current Time: {current_time}")

    local_now = timezone.localtime(timezone.now())

    print(local_now)

    try:
        rides = Ride.objects.filter(
            status="ACTIVE",
            pickup_date__gte=today,
            pickup_time__gte=current_time
        ).order_by("-created_at")
        
        serializer = RideSerializer(rides, many=True, context={"request": request})

        return Response(
            {
                "success": True,
                "message": "Rides fetched successfully",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        return Response(
            {
                "success": False,
                "message": "Failed to fetch rides",
                "error": str(e),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# Offer Ride
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def offer_ride(request):

    try:
        # GET LAST OFFERED RIDE
        last_ride = Ride.objects.filter(
            user=request.user
        ).order_by("-created_at").first()

        if last_ride:

            next_allowed_time = last_ride.created_at + timedelta(hours=1)
            if timezone.now() < next_allowed_time:

                remaining_minutes = int(
                    (next_allowed_time - timezone.now()).total_seconds() / 60
                )

                return Response(
                    {
                        "success": False,
                        "message": (
                            f"You can offer another ride after {remaining_minutes} minute(s)"
                        ),
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
        serializer = RideSerializer(data=request.data, context={"request": request})
        
        if serializer.is_valid():
            ride = serializer.save(user=request.user)

            RideChatRoom.objects.create(ride=ride)  # Create chat room for the ride

            return Response(
                {
                    "success": True,
                    "message": "Ride offered successfully",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {
                "success": False,
                "message": "Invalid ride details",
                "errors": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    except Exception as e:
        return Response(
            {
                "success": False,
                "message": "Something went wrong while offering ride",
                "error": str(e),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def search_rides(request):

    try:
        pickup_location = request.data.get("pickup_location")
        drop_location = request.data.get("drop_location")
        pickup_date = request.data.get("pickup_date")
        pickup_time = request.data.get("pickup_time")
        price_per_seat = request.data.get("price_per_seat")

        # Mandatory Fields Check
        if not pickup_location or not drop_location:

            return Response(
                {
                    "success": False,
                    "message": "Pickup and Drop locations are required",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Base Query
        rides = Ride.objects.filter(
            pickup_location__icontains=pickup_location,
            drop_location__icontains=drop_location,
            status="ACTIVE",
        )

        # Optional Filters
        if pickup_date:
            rides = rides.filter(pickup_date=pickup_date)

        if pickup_time:
            rides = rides.filter(pickup_time=pickup_time)

        if price_per_seat:
            rides = rides.filter(price_per_seat__lte=price_per_seat)

        # No Matching Records
        if not rides.exists():

            return Response(
                {
                    "success": False,
                    "message": f"No rides found from {pickup_location} to {drop_location}",
                    "data": [],
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Serialize Data
        serializer = RideSerializer(
            rides,
            many=True,
            context={"request": request},
        )

        return Response(
            {
                "success": True,
                "message": "Rides fetched successfully",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    except Exception as e:

        return Response(
            {
                "success": False,
                "message": "Something went wrong while searching rides",
                "error": str(e),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_ride(request, ride_id):
    try:
        # 🔹 Get ride owned by user
        ride = Ride.objects.get(id=ride_id, user=request.user)

        # 🔹 Serialize update data
        serializer = RideSerializer(
            ride, data=request.data, partial=True, context={"request": request}
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "success": True,
                    "message": "Ride updated successfully",
                    "data": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "success": False,
                "message": "Invalid ride details",
                "errors": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    except Ride.DoesNotExist:
        return Response(
            {
                "success": False,
                "message": "Ride not found",
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    except Exception as e:
        return Response(
            {
                "success": False,
                "message": "Something went wrong while updating ride",
                "error": str(e),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def start_ride(request, ride_id):

    try:
        ride = Ride.objects.get(id=ride_id, user=request.user)

        if ride.status != "ACTIVE":
            return Response(
                {"success": False, "message": "Ride cannot be started"}, status=400
            )

        ride.status = "STARTED"
        ride.save()

        return Response(
            {
                "success": True,
                "message": "Ride started successfully",
                "data": {"status": ride.status},
            }
        )

    except Ride.DoesNotExist:
        return Response({"success": False, "message": "Ride not found"}, status=404)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def complete_ride(request, ride_id):

    try:
        ride = Ride.objects.get(id=ride_id, user=request.user)

        if ride.status != "STARTED":
            return Response(
                {"success": False, "message": "Ride must be started first"}, status=400
            )

        ride.status = "COMPLETED"
        ride.save()

        ride.chat_room.is_active = False
        ride.chat_room.save()


        return Response(
            {
                "success": True,
                "message": "Ride completed successfully",
                "data": {"status": ride.status},
            }
        )

    except Ride.DoesNotExist:
        return Response({"success": False, "message": "Ride not found"}, status=404)
