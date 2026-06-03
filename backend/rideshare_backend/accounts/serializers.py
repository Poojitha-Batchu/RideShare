from rest_framework import serializers
from .models import User
from django.contrib.auth.hashers import make_password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'phone', 'gender', 'password', 'date_of_birth', 'profile_image', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        # 🔐 hash password before saving
        validated_data['password'] = make_password(validated_data['password'])
        return User.objects.create(**validated_data)