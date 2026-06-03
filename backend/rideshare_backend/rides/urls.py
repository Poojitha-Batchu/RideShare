from django.urls import path
from . import views

urlpatterns = [
    path('all/', views.get_all_rides, name='get_all_rides'),
    path('offer-ride/', views.offer_ride, name='offer_ride'),
    path('search-ride/', views.search_rides, name='search_rides'),
    path('update-ride/<int:ride_id>/', views.update_ride, name='update_ride'),
    path('start-ride/<int:ride_id>/', views.start_ride, name='start_ride'),
    path('complete-ride/<int:ride_id>/', views.complete_ride, name='complete_ride'),
]