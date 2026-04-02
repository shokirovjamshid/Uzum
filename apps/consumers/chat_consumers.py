from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer

from apps.models import ChatRoom, User, Shop, Message, Seller


class ChatConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        self.user = self.scope["user"]
        if not self.user.is_authenticated:
            await self.close()
            return
        self.slug = self.scope["url_route"]["kwargs"]["slug"]
        self.shop = await Shop.objects.aget(slug=self.slug)
        self.group_name = f"shop_{self.slug}_{self.user.id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        message = content.get("message")
        image = content.get("image")
        if self.user.type == User.TypeChoice.USER:
            self.chat, created = await ChatRoom.objects.aget_or_create(buyer=self.user, shop=self.shop)
            receiver_id = await sync_to_async(lambda: self.shop.seller.user_id)()
            print(receiver_id)
        if self.user.type == User.TypeChoice.SELLER:
            receiver_id = content.get("user_id")
            self.chat, created = await ChatRoom.objects.aget_or_create(buyer=receiver_id, shop=self.shop)

        if not message and not image:
            return
        await Message.objects.acreate(chat=self.chat, sender=self.user, text=message, image=image)
        await self.channel_layer.group_send(f"shop_{self.slug}_{receiver_id}",
                                            {
                                                'type': 'chat_message',
                                                'message': message,
                                                'image': image,
                                            })

    async def chat_message(self, event):
        await self.send_json({
            "message": event.get("message"),
            "image": event.get("image"),
        })
