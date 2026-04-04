import ujson
from channels.generic.websocket import AsyncJsonWebsocketConsumer

from apps.models.chats import Message
from apps.models.users import User


class CustomAsyncJsonWebsocketConsumer(AsyncJsonWebsocketConsumer):

    @classmethod
    async def decode_json(cls, text_data):
        return ujson.loads(text_data)

    @classmethod
    async def encode_json(cls, content):
        return ujson.dumps(content)

    async def save_msg(self, **data):
        return await Message.objects.acreate(**data)

    async def get_user(self, user_id):
        try:
            return await User.objects.aget(id=user_id)
        except User.DoesNotExist:
            return None

    async def update_is_online(self, is_online):
        if self.user.type == User.TypeChoice.USER:
            self.user.is_online = is_online
            await self.user.asave(update_fields=['is_online'])
        elif self.user.type == User.TypeChoice.SELLER:
            self.shop.is_online = is_online
            await self.shop.asave(update_fields=['is_online'])
