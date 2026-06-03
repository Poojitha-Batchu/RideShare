from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from bookings.models import Booking
from rides.models import Ride
from .serializers import RideChatMessageSerializer
from .utils import has_chat_access, get_booking_status_reason
from .models import RideChatMessage, RideChatRoom


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_chat_messages(request, ride_id):

    try:

        # GET RIDE
        try:
            ride = Ride.objects.get(id=ride_id)

        except Ride.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "message": "Ride not found",
                    "has_access": False,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # OPTIONAL BOOKING ID
        booking_id = request.GET.get("booking_id")

        # ==========================================
        # BOOKING SCREEN ACCESS CHECK
        # ==========================================
        if booking_id:

            try:
                booking = Booking.objects.get(id=booking_id,passenger=request.user)

                if booking.booking_status == "CANCELLED":
                    return Response(
                        {
                            "success": False,
                            "message": "You don't have access to this chat, as you have cancelled this ride",
                            "has_access": False,
                        },
                        status=status.HTTP_403_FORBIDDEN,
                    )

            except Booking.DoesNotExist:
                return Response(
                    {
                        "success": False,
                        "message": "Booking not found",
                        "has_access": False,
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )

        # ==========================================
        # MY OFFERED RIDES ACCESS CHECK
        # ==========================================
        else:

            # Driver opening his own ride
            if ride.user == request.user:

                if ride.status == "CANCELLED":
                    return Response(
                        {
                            "success": False,
                            "message": "You don't have access to this chat, as this ride has been cancelled",
                            "has_access": False,
                        },
                        status=status.HTTP_403_FORBIDDEN,
                    )

            # Passenger opening without booking_id
            else:

                confirmed_booking = Booking.objects.filter(
                    ride=ride,
                    passenger=request.user,
                    booking_status="CONFIRMED"
                ).exists()

                if not confirmed_booking:
                    return Response(
                        {
                            "success": False,
                            "message": "Access denied",
                            "has_access": False,
                        },
                        status=status.HTTP_403_FORBIDDEN,
                    )

        # ==========================================
        # GET CHAT ROOM
        # ==========================================
        try:
            room = ride.chat_room

        except RideChatRoom.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "message": "Chat room not found",
                    "has_access": False,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # ==========================================
        # GET MESSAGES
        # ==========================================
        messages = room.messages.all().order_by("sent_at")

        serializer = RideChatMessageSerializer(
            messages,
            many=True
        )

        return Response(
            {
                "success": True,
                "messages": serializer.data,
                "chat_active": room.is_active,
                "has_access": True,
            },
            status=status.HTTP_200_OK,
        )

    except Exception as e:

        return Response(
            {
                "success": False,
                "message": "Something went wrong while fetching messages",
                "error": str(e),
                "has_access": False,
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_message(request, ride_id):

    try:
        ride = Ride.objects.get(id=ride_id)

        if not has_chat_access(request.user, ride):
            reason = get_booking_status_reason(request.user, ride)
            return Response(
                {"success": False, "message": reason or "Access denied"},
                status=status.HTTP_403_FORBIDDEN,
            )

        room = ride.chat_room

        if not room.is_active:
            return Response(
                {"success": False, "message": "Chat is closed"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        message = request.data.get("message")

        if not message:
            return Response(
                {"success": False, "message": "Message is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        chat_message = RideChatMessage.objects.create(
            room=room, sender=request.user, message=message
        )

        serializer = RideChatMessageSerializer(chat_message)

        return Response(
            {"success": True, "message": "Message sent", "data": serializer.data}
        )

    except Ride.DoesNotExist:
        return Response(
            {"success": False, "message": "Ride not found"},
            status=status.HTTP_404_NOT_FOUND,
        )
