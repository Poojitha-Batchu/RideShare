from django.urls import path
from . import views

urlpatterns = [
    path('signup/', views.signup, name='signup'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('profile/', views.profile, name='profile'),
    path('update-profile/', views.update_profile, name='update_profile'),
    path('forgot-password/', views.forgot_password, name='forgot_password'),
    path('logs/frontend/', views.frontend_logs, name='frontend_logs'),
]