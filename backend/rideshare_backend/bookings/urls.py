from django.urls import path
from . import views

urlpatterns = [
    path('book-ride/', views.book_ride, name='book-ride'),
    path('my-bookings/', views.my_bookings, name='my-bookings'),
    path('cancel-booking/', views.cancel_booking, name='cancel-booking'),
    path('my-offered-rides/', views.my_offered_rides, name='my-offered-rides'),
    path('cancel-ride/', views.cancel_ride, name='cancel-ride'),
    path('mark-payment-paid/<int:booking_id>/', views.mark_payment_paid, name='mark-payment-paid'),
]