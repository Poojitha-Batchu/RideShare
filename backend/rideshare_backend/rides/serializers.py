from rest_framework import serializers
from django.db.models import Avg
from .models import Ride
from ride_review.models import RideReview


class RideSerializer(serializers.ModelSerializer):

    ride_id = serializers.IntegerField(source="id", read_only=True)
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    user_name = serializers.CharField(source="user.full_name", read_only=True)
    user_email = serializers.CharField(source="user.email", read_only=True)
    user_profile_image = serializers.SerializerMethodField(read_only=True)
    average_rating = serializers.SerializerMethodField()
    total_offered_rides = serializers.SerializerMethodField()

    class Meta:
        model = Ride
        fields = "__all__"

        read_only_fields = [
            "ride_id",
            "user",
            "user_id",
            "user_name",
            "user_email",
            "user_profile_image",
            "created_at",
            "updated_at",
            "status",
            "average_rating",
            "total_offered_rides",
        ]

    def get_user_profile_image(self, obj):
        request = self.context.get("request")

        if obj.user.profile_image:

            # If request exists
            if request:
                return request.build_absolute_uri(
                    obj.user.profile_image.url
                )

            # Fallback
            return obj.user.profile_image.url

        return None
    
    def get_average_rating(self, obj):
        avg_rating = RideReview.objects.filter(
            driver=obj.user
        ).aggregate(avg=Avg("rating"))

        return round(avg_rating["avg"], 1) if avg_rating["avg"] else 0
    
    def get_total_offered_rides(self, obj):
        return Ride.objects.filter(
            user=obj.user,
            status = "COMPLETED"
        ).count()
