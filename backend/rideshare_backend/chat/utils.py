from bookings.models import Booking

def has_chat_access(user, ride):
    # Check if ride is cancelled - no one can access chat
    if ride.status == 'CANCELLED':
        return False

    # Ride owner (driver) has access if ride is not cancelled
    if ride.user == user:
        return True

    # Passenger has access only if they have a CONFIRMED booking and ride is not cancelled
    return Booking.objects.filter(
        ride=ride,
        passenger=user,
        booking_status="CONFIRMED"
    ).exists()


def get_booking_status_reason(user, ride):
    """
    Get the reason why a user doesn't have chat access.
    Returns a descriptive message for the user.
    """
    # Check if ride is cancelled
    if ride.status == 'CANCELLED':
        return "You don't have access to this chat, as this ride has been cancelled"
    
    # Ride owner (driver) has access
    if ride.user == user:
        return None  # User has access
    
    # Check passenger booking status
    booking = Booking.objects.filter(
        ride=ride,
        passenger=user
    ).first()
    
    if not booking:
        return "You have not booked this ride"
    
    if booking.booking_status == 'CANCELLED':
        return "You don't have access to this chat, as you have cancelled this ride"
    
    return "Your booking is not confirmed. Access denied."
