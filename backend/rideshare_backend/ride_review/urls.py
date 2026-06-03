from django.urls import path
from . import views

urlpatterns = [
    path('add-review/', views.add_review, name='add_review'),
    path("get-review/<int:booking_id>/",views.get_review,name="get_review"),
]