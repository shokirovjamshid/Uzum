from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication

jwt_auth = JWTAuthentication()


@database_sync_to_async
def _get_user_from_token(token: str):
    if not token:
        return AnonymousUser()
    try:
        validated = jwt_auth.get_validated_token(token)
        return jwt_auth.get_user(validated)
    except Exception:
        return AnonymousUser()


class JWTAuthMiddleware:

    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        headers = dict(scope.get("headers", []))
        token = None

        # Prefer Authorization header
        auth_header = headers.get(b"authorization")
        if auth_header:
            try:
                auth_header = auth_header.decode()
                if auth_header.startswith("Bearer "):
                    token = auth_header.split(" ", 1)[1]
            except Exception:
                token = None

        # Fallback to query string token
        if not token:
            query_string = scope.get("query_string", b"").decode()
            if query_string:
                params = parse_qs(query_string)
                token_list = params.get("token") or params.get("access")
                if token_list:
                    token = token_list[0]

        scope["user"] = await _get_user_from_token(token)
        return await self.inner(scope, receive, send)
