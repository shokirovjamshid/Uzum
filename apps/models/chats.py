from django.db.models import Model, ForeignKey, CASCADE, DateTimeField, TextField, BooleanField, Index, ImageField


class ChatRoom(Model):
    buyer = ForeignKey("apps.User", CASCADE, related_name="customer_chats", limit_choices_to={'type': 'user'},
                       db_index=True)
    shop = ForeignKey('apps.Shop', CASCADE, related_name="shop_chats", db_index=True)
    last_message_at = DateTimeField(auto_now=True)
    created_at = DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('buyer', 'shop')
        ordering = ['-last_message_at']
        verbose_name_plural = "Chat rooms"
        verbose_name = "Chat room"

    def __str__(self):
        return f"Chat: {self.buyer.phone} <-> {self.shop.name}"


class Message(Model):
    chat = ForeignKey("apps.ChatRoom", CASCADE, related_name="messages")
    sender = ForeignKey("apps.User", CASCADE, related_name="sent_messages")
    text = TextField(null=True, blank=True)
    image = ImageField(null=True, blank=True, upload_to='chat/%Y/%m/%d')
    is_read = BooleanField(default=False, db_index=True)
    read_at = DateTimeField(null=True, blank=True)
    created_at = DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['created_at']

        indexes = [
            Index(fields=['chat', 'is_read', 'created_at']),
        ]

    def __str__(self):
        return f"Msg from {self.sender.phone} in Room {self.chat_id}"
