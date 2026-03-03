from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.views import CityListAPIView, DeliveryPointsListAPIView, DeliveryPointsRetrieveAPIView, CategoryListAPIView, \
    RegisterSmsCodeAPIView, RegisterAPIView, ProductListAPIView

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('cities', CityListAPIView.as_view(), name='city_list_api'),
    path('delivery-points', DeliveryPointsListAPIView.as_view(), name='delivery_points_api'),
    path('delivery-points/<int:pk>', DeliveryPointsRetrieveAPIView.as_view(), name='delivery_point_api'),
    path('categories', CategoryListAPIView.as_view(), name='category_list'),
    path('register-sms-code/<str:phone>', RegisterSmsCodeAPIView.as_view(), name='register_sms_code'),
    path('register', RegisterAPIView.as_view(), name='register'),
    path('category/<slug:slug>/', ProductListAPIView.as_view(),name='product_list')
]
