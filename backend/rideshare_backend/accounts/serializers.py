from rest_framework import serializers
from .models import User
from django.contrib.auth.hashers import make_password

class UserSerializer(serializers.ModelSerializer):
    profile_image = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'phone', 'gender', 'password', 'date_of_birth', 'profile_image', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'email']
        extra_kwargs = {
            'password': {'required': False, 'write_only': True},
            'full_name': {'required': False},
            'phone': {'required': False},
            'gender': {'required': False},
            'date_of_birth': {'required': False},
            'profile_image': {'required': False},
        }

    def create(self, validated_data):
        # 🔐 hash password before saving
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        return User.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        # 🔐 hash password if provided during update
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        return super().update(instance, validated_data)
