from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.views import CategoryListAPIView, \
    RegisterSmsCodeAPIView, RegisterAPIView, ProductListAPIView, FavoriteProductView, \
    ShopRetrieveUpdateDestroyAPIView, ShopListCreateAPIView, CommentListAPIView, CommentCreateAPIView
from apps.views import (CityListAPIView, DeliveryPointsListAPIView, DeliveryPointsRetrieveAPIView, ChatHistoryView,
                        ImageUploadView, ChatRoomListView, ChatRoomGetOrCreateView, )
from apps.views import (QRCodeLoginRequestView, QRCodeLoginAuthorizeView, QRCodeLoginStatusView, )

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('cities', CityListAPIView.as_view(), name='city_list_api'),
    path('delivery-points', DeliveryPointsListAPIView.as_view(), name='delivery_points_api'),
    path('delivery-points/<int:pk>', DeliveryPointsRetrieveAPIView.as_view(), name='delivery_point_api'),
    path('categories', CategoryListAPIView.as_view(), name='category_list'),
    path('register-sms-code/<str:phone>', RegisterSmsCodeAPIView.as_view(), name='register_sms_code'),
    path('register', RegisterAPIView.as_view(), name='register'),
    path('category/<slug:slug>/', ProductListAPIView.as_view(), name='product_list'),

    # QR-code auth
    path("auth/qr/request/", QRCodeLoginRequestView.as_view(), name="qr_login_request"),
    path("auth/qr/authorize/", QRCodeLoginAuthorizeView.as_view(), name="qr_login_authorize"),
    path("auth/qr/status/", QRCodeLoginStatusView.as_view(), name="qr_login_status"),

    # Chat REST API
    path("rooms/", ChatRoomListView.as_view(), name="chat_rooms"),
    path("rooms/get-or-create/<int:store_id>/", ChatRoomGetOrCreateView.as_view(), name="chat_room_init"),
    path("rooms//history/<int:room_id>", ChatHistoryView.as_view(), name="chat_history"),
    path("upload-image/", ImageUploadView.as_view(), name="chat_image_upload"),

    # Products
    path('products', ProductListAPIView.as_view(), name='product_list'),
    path("user/favorites", FavoriteProductView.as_view(), name="product_list"),
    path('user/favorite/<int:pk>', FavoriteProductView.as_view(), name='product_detail'),
    path('shops/<slug:slug>', ShopRetrieveUpdateDestroyAPIView.as_view(), name='shop_profile'),
    path('shops', ShopListCreateAPIView.as_view(), name='shop_list_and_create_apies'),
    path('products/comments', CommentListAPIView.as_view(), name='comments_list'),
    path('comments/create', CommentCreateAPIView.as_view(), name='comment_create'),
]
