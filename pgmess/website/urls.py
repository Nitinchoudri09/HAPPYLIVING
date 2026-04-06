from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('improved/', views.improved_home, name='improved_home'),
    path('student/dashboard/', views.student_dashboard, name='student_dashboard'),
    path('student/payments/', views.student_payments, name='student_payments'),
    path('student/login/', views.student_login, name='student_login'),
    path('forgot-password/', views.forgot_password, name='forgot_password'),
    path('debug/', views.debug_info, name='debug_info'),
]
