from django.db import models
from accounts.models import User
from rides.models import Ride


class RideChatRoom(models.Model):

    ride = models.OneToOneField(
        Ride, on_delete=models.CASCADE, related_name="chat_room"
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "ride_chat_rooms"

    def __str__(self):

        try:
            return f"Chat Room - Ride {self.ride.id}"

        except Exception as e:
            return f"Chat Room Error: {str(e)}"

    # SAFE CLOSE CHAT METHOD
    def close_chat(self):

        try:
            self.is_active = False
            self.save()

            return {"success": True, "message": "Chat closed successfully"}

        except Exception as e:

            return {
                "success": False,
                "message": "Failed to close chat",
                "error": str(e),
            }


class RideChatMessage(models.Model):

    room = models.ForeignKey(
        RideChatRoom, on_delete=models.CASCADE, related_name="messages"
    )

    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "ride_chat_messages"
        ordering = ["sent_at"]

    def __str__(self):

        try:
            return f"{self.sender.username}: {self.message[:20]}"

        except Exception as e:
            return f"Message Error: {str(e)}"

    # SAFE MESSAGE CREATION METHOD
    @classmethod
    def create_message(cls, room, sender, message):

        try:
            chat_message = cls.objects.create(room=room, sender=sender, message=message)
            return {
                "success": True,
                "message": "Message sent successfully",
                "data": chat_message,
            }

        except Exception as e:
            return {
                "success": False,
                "message": "Failed to send message",
                "error": str(e),
            }
