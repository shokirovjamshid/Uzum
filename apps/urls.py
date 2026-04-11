from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.views import (
    CityListAPIView,
    DeliveryPointsListAPIView,
    DeliveryPointsRetrieveAPIView,
    # ImageUploadView,
    CategoryListAPIView,
    RegisterSmsCodeAPIView,
    RegisterAPIView,
    ShopRetrieveUpdateDestroyAPIView,
    ShopListCreateAPIView,
    FavoriteProductRetrieveAPIView,
    FavoriteProductListCreateAPIView,
    ProductModelViewSet,
    QRCodeLoginRequestView,
    QRCodeLoginAuthorizeView,
    QRCodeLoginStatusView, ChatHistoryListAPIView, UserChatRoomListAPIView,
)
from apps.views.auths import UserUpdateAPIView, UserDetailAPIView
from apps.views.chats import SellerChatRoomListAPIView, ImageUploadView
from apps.views.products import CategoryDetailAPIView

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('cities', CityListAPIView.as_view(), name='city_list_api'),
    path('delivery-points', DeliveryPointsListAPIView.as_view(), name='delivery_points_api'),
    path('delivery-points/<int:pk>', DeliveryPointsRetrieveAPIView.as_view(), name='delivery_point_api'),
    path('register-sms-code/<str:phone>', RegisterSmsCodeAPIView.as_view(), name='register_sms_code'),
    path('register', RegisterAPIView.as_view(), name='register'),
    path('user/update/<int:pk>/', UserUpdateAPIView.as_view(), name='update_user'),
    path('user/me/', UserDetailAPIView.as_view(), name='user_detail'),

    # QR-code auth
    path("auth/qr/request/", QRCodeLoginRequestView.as_view(), name="qr_login_request"),
    path("auth/qr/authorize/", QRCodeLoginAuthorizeView.as_view(), name="qr_login_authorize"),
    path("auth/qr/status/", QRCodeLoginStatusView.as_view(), name="qr_login_status"),

    # Chat REST API
    path("rooms/", UserChatRoomListAPIView.as_view(), name="chat_room_list"),
    path("rooms/<int:pk>/historys/", ChatHistoryListAPIView.as_view(), name="chat_history"),
    path("shops/<slug:slug>/rooms/", SellerChatRoomListAPIView.as_view(), name="seller_room_list"),
    path('rooms/upload-image/', ImageUploadView.as_view(), name='upload_image'),

    # Products
    path("user/favorites/", FavoriteProductListCreateAPIView.as_view(), name="product_list"),
    path('user/favorite/<slug:slug>', FavoriteProductRetrieveAPIView.as_view(), name='favorite_product_detail'),
    path('shops/<slug:slug>', ShopRetrieveUpdateDestroyAPIView.as_view(), name='shop_profile'),
    path('shops', ShopListCreateAPIView.as_view(), name='shop_list_and_create_apies'),
    path('categories', CategoryListAPIView.as_view(), name='category_list'),  # ☑️
    path('categoriesdetail', CategoryDetailAPIView.as_view(), name='category_detail_list'),  # ☑️
]

router = DefaultRouter()
router.register("products", ProductModelViewSet)
urlpatterns += router.urls
