from django.urls import path
from . import views

urlpatterns = [
    path('messages/<int:ride_id>/', views.get_chat_messages),
    path('send/<int:ride_id>/', views.send_message),
]
