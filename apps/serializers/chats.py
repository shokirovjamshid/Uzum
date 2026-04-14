from datetime import timedelta

from django.utils.timezone import now
from rest_framework.fields import SerializerMethodField
from rest_framework.serializers import ModelSerializer

from apps.models.chats import Message, ChatRoom


class MessageSerializer(ModelSerializer):
    class Meta:
        model = Message
        fields = ('id', 'chat', 'sender', 'text', 'image', 'created_at', 'is_read')


class ChatRoomModelSerializer(ModelSerializer):
    class Meta:
        model = ChatRoom
        fields = '__all__'
        ordering = 'last_message_at',

    def to_representation(self, instance: ChatRoom):
        repr = super().to_representation(instance)
        repr['last_message_at'] = instance.last_message_at.date() if instance.last_message_at + timedelta(
            days=1) < now() else instance.last_message_at.time().strftime('%H:%M')
        last_message = instance.messages.order_by('-created_at').first().text
        repr['last_message'] = last_message if last_message else '🌄'
        repr['message_not_read_count'] = instance.messages.filter(is_read=False).count()
        return repr


class ChatRoomSerializer(ModelSerializer):
    last_message = SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = ('id', 'buyer', 'shop', 'last_message_at', 'last_message',)

    def get_last_message(self, obj):
        message = getattr(
            obj,
            "_last_message",
            None) or obj.messages.order_by('-created_at').first()
        if not message:
            return None
        return MessageSerializer(message).data
