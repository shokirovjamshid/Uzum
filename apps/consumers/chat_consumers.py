from asgiref.sync import sync_to_async

from apps.consumers.base import CustomAsyncJsonWebsocketConsumer
from apps.models import ChatRoom, Shop


class ChatConsumer(CustomAsyncJsonWebsocketConsumer):

    async def connect(self):
        self.user = self.scope["user"]
        self.slug = self.scope["url_route"]["kwargs"]["slug"]
        self.shop = await Shop.objects.select_related('seller', 'seller__user').aget(slug=self.slug)

        if not self.user.is_authenticated or self.shop is None:
            await self.close()
            return
        self.group_name = f"shop_{self.slug}_{self.user.id}"
        if self.user.is_seller and self.shop.seller.user != self.user:
            await self.close()
            return

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        await self.update_is_online(False)

    async def receive_json(self, content, **kwargs):
        """

        user -> seller   {"message":"", "image":""}
        seller -> user   {"user_id":0, "message":"", "image":""}

        """
        is_me = content.get("is_me")
        if not is_me:
            message = content.get("message")
            image = content.get("image")
            if self.user.is_user:
                self.chat, created = await ChatRoom.objects.aget_or_create(buyer=self.user, shop=self.shop)
                receiver_id = await sync_to_async(lambda: self.shop.seller.user_id)()
            if self.user.is_seller:
                receiver_id = content.get("user_id")
                self.chat, created = await ChatRoom.objects.aget_or_create(buyer=receiver_id, shop=self.shop)

            if not message and not image:
                return
            message_obj = await self.save_msg(chat=self.chat, sender=self.user, text=message, image=image)
            await self.channel_layer.group_send(f"shop_{self.slug}_{self.user.id}",
                                                {
                                                    'type': 'me_message',
                                                    'message_id': message_obj.id
                                                })
            await self.channel_layer.group_send(f"shop_{self.slug}_{receiver_id}",
                                                {
                                                    'type': 'chat_message',
                                                    'message': message,
                                                    'image': image,
                                                })
        else:
            message_id = content.get("message_id")

    async def chat_message(self, event):
        await self.send_json(message=event.get("message"), image=event.get("image"), is_me=False)

    async def me_message(self, event):
        await self.send_json(message_id=event.get("message_id"), is_me=True)
