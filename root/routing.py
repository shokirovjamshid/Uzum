from django.urls import re_path, path

from apps.consumers.chat_consumers import ChatConsumer

websocket_urlpatterns = [
    path('ws/chat/<slug:slug>/', ChatConsumer.as_asgi()),
]
