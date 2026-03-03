import json
from apps.consumers.utils import _status_cache_key
from channels.db import database_sync_to_async
from django.core.cache import cache
from django.utils import timezone

from apps.consumers.base import CustomAsyncJsonWebsocketConsumer
from apps.models.chats import ChatRoom, Message
from apps.models.users import User


class ChatConsumer(CustomAsyncJsonWebsocketConsumer):

    async def connect(self):
        user = self.scope.get("user")
        if not user or not user.is_authenticated:
            await self.close()
            return

        self.user = user
        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.room_group_name = f"chat_{self.room_id}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self._set_user_online(True)

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        await self._set_user_online(False)

    async def receive(self, text_data=None, bytes_data=None):
        if text_data is None:
            return

        try:
            data = json.loads(text_data)
        except (TypeError, ValueError):
            return

        action = data.get("action")

        if action == "send_message":
            await self._handle_send_message(data)
        elif action == "mark_read":

            await self._handle_mark_read()
        elif action == "ping":

            await self._set_user_online(True)

    async def _handle_send_message(self, data: dict):
        text = (data.get("text") or "").strip()
        image_url = (data.get("image_url") or "").strip()

        if self.user.type == User.TypeChoice.USER and text:
            return

        if not text and not image_url:
            return

        message = await self._create_message(text=text, image_url=image_url)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "consumers.message",
                "payload": {
                    "id": message["id"],
                    "room_id": int(self.room_id),
                    "sender_id": self.user.id,
                    "text": message["text"],
                    "image_url": message["image_url"],
                    "timestamp": message["timestamp"],
                    "is_read": message["is_read"],
                },
            },
        )

    async def _handle_mark_read(self):
        message_ids = await self._mark_unread_messages_as_read()
        if not message_ids:
            return

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "consumers.read_receipt",
                "payload": {
                    "message_ids": message_ids,
                    "reader_id": self.user.id,
                    "read_at": timezone.now().isoformat(),
                },
            },
        )

    async def chat_message(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "message",
                    **event["payload"],
                }
            )
        )

    async def chat_read_receipt(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "read_receipt",
                    **event["payload"],
                }
            )
        )

    @database_sync_to_async
    def _create_message(self, text: str, image_url: str):
        room = ChatRoom.objects.select_related("buyer", "seller").get(pk=self.room_id)
        msg = Message.objects.create(
            room=room,
            sender=self.user,
            text=text,
            image_url=image_url,
        )

        ChatRoom.objects.filter(pk=room.pk).update(last_message_at=timezone.now())

        return {
            "id": msg.id,
            "text": msg.text,
            "image_url": msg.image_url,
            "timestamp": msg.timestamp.isoformat(),
            "is_read": msg.is_read,
        }

    @database_sync_to_async
    def _mark_unread_messages_as_read(self):
        unread_qs = Message.objects.filter(
            room_id=self.room_id,
            is_read=False,
        ).exclude(sender=self.user)

        ids = list(unread_qs.values_list("id", flat=True))
        if not ids:
            return []

        unread_qs.update(is_read=True, read_at=timezone.now())
        return ids

    @database_sync_to_async
    def _set_user_online(self, is_online: bool):
        cache.set(
            _status_cache_key(self.user.id),
            "online" if is_online else "offline",
            timeout=None,
        )
