from rest_framework import serializers
from .models import RideChatMessage


class RideChatMessageSerializer(serializers.ModelSerializer):

    sender_name = serializers.CharField(source='sender.full_name', read_only=True)

    class Meta:
        model = RideChatMessage
        fields = '__all__'
