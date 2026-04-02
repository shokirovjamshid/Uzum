from django.core.signing import TimestampSigner
from drf_spectacular.utils import extend_schema
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated

from apps.models.chats import ChatRoom, Message
from apps.paginations import CommentPagination
from apps.permissions import IsSellerUser
from apps.serializers import (MessageSerializer, ChatRoomModelSerializer,
                              )

signer = TimestampSigner()


# @extsignerend_schema(tags=["Chat"], )
# class ImageUploadView(APIView):
#     permission_classes = [IsAuthenticated]
#     serializer_class = MessageSerializer
#
#     def post(self, request, *args, **kwargs):
#         file_obj = request.FILES.get("image")
#         if not file_obj:
#             return Response({"detail": "No image file provided."},
#                             status=status.HTTP_400_BAD_REQUEST)
#
#         path = default_storage.save(f"consumers/{file_obj.name}", file_obj)
#         image_url = default_storage.url(path)
#
#         return Response({"image_url": image_url},
#                         status=status.HTTP_201_CREATED)


@extend_schema(tags=["Chat"])
class UserChatRoomListAPIView(ListAPIView):
    serializer_class = ChatRoomModelSerializer
    queryset = ChatRoom.objects.select_related('shop').prefetch_related('messages').only('shop__name', 'shop__slug',
                                                                                         'shop__image',
                                                                                         'last_message_at', 'messages')
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.filter(buyer=self.request.user)


@extend_schema(tags=["Chat"])
class ChatHistoryListAPIView(ListAPIView):
    queryset = Message.objects.only('text', 'image', 'created_at', 'sender').order_by('-created_at')
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = CommentPagination

    def get_queryset(self):
        queryset = super().get_queryset()
        chat_id = self.kwargs['pk']
        return queryset.filter(chat_id=chat_id, chat__buyer=self.request.user)


class SellerChatRoomListAPIView(ListAPIView):
    serializer_class = ChatRoomModelSerializer
    queryset = ChatRoom.objects.select_related('shop').prefetch_related('messages').only('shop__name', 'shop__slug',
                                                                                         'shop__image',
                                                                                         'last_message_at', 'messages')
    permission_classes = [IsAuthenticated, IsSellerUser]

    def get_queryset(self):
        queryset = super().get_queryset()
        shop_slug = self.kwargs['slug']
        return queryset.filter(shop_slug=shop_slug)
