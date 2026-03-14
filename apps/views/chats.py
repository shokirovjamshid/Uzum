from django.core.files.storage import default_storage
from django.core.signing import TimestampSigner
from django.db.models import Count, Q, Prefetch
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.generics import ListAPIView, GenericAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.models import Shop
from apps.models.chats import ChatRoom, Message
from apps.serializers import (MessageSerializer, ChatRoomListSerializer,
                              )

signer = TimestampSigner()


@extend_schema(tags=["Chat"], )
class ImageUploadView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get("image")
        if not file_obj:
            return Response({"detail": "No image file provided."}, status=status.HTTP_400_BAD_REQUEST)

        path = default_storage.save(f"consumers/{file_obj.name}", file_obj)
        image_url = default_storage.url(path)

        return Response({"image_url": image_url}, status=status.HTTP_201_CREATED)


@extend_schema(tags=["Chat"])
class ChatRoomListView(ListAPIView):
    serializer_class = ChatRoomListSerializer

    def get_queryset(self):
        user = self.request.user
        qs = ChatRoom.objects.filter(Q(buyer=user) | Q(shop__seller__user=user))

        qs = qs.annotate(unread_count=Count('messages', filter=Q(messages__is_read=False) & ~Q(messages__sender=user)))

        return qs.prefetch_related(Prefetch('messages', queryset=Message.objects.order_by('-timestamp'),
                                            to_attr='latest_message')).select_related('buyer', 'shop')


@extend_schema(tags=["Chat"])
class ChatRoomGetOrCreateView(GenericAPIView):

    def post(self, request, shop_id):
        user = request.user
        try:
            store = Shop.objects.get(id=shop_id)
        except Shop.DoesNotExist:
            return Response({"error": "Shop topilmadi"}, status=status.HTTP_404_NOT_FOUND)

        room, created = ChatRoom.objects.get_or_create(buyer=user, shop=store)

        return Response({"room_id": room.id, "is_new": created}, status=status.HTTP_200_OK)


@extend_schema(tags=["Chat"])
class ChatHistoryView(ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    queryset = Message.objects.all()

    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        room_id = self.kwargs["room_id"]
        qs = Message.objects.filter(room_id=room_id).select_related("chat", "sender")

        before_id = self.request.query_params.get("before_id")
        if before_id:
            qs = qs.filter(id__lt=before_id)

        return qs.order_by("-timestamp")
