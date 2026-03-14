import uuid

from django.core.cache import cache
from django.core.signing import TimestampSigner, SignatureExpired, BadSignature
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.models import User
from apps.serializers import (QRLoginStatusResponseSerializer, QRLoginRequestResponseSerializer,
                              QRLoginAuthorizeRequestSerializer, RegisterSerializer, )
from apps.tasks import register_key
from apps.utils import _generate_qr_image_base64
from root.settings import r

signer = TimestampSigner()


@extend_schema(tags=['Auth'])
class RegisterSmsCodeAPIView(APIView):
    def get(self, request, phone):

        if request.user.is_authenticated:
            return Response({'message': "Royhatdan o'tgansiz"})
        key = register_key(phone)
        remaining_time = r.ttl(key)
        if cache.get(key) is None and remaining_time == 2:
            return Response({'message': 'Tasdiqlash uchun kode yuborildi', "ttl": 300})
        elif cache.get(key) is None and remaining_time == 1:
            return Response({'message': 'Tasdiqlash uchun kode yuborildi', "ttl": remaining_time})


@extend_schema(tags=['Auth'])
class RegisterAPIView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer


@extend_schema(tags=["Auth"])
class QRCodeLoginRequestView(APIView):
    permission_classes = [AllowAny]
    pagination_class = None

    def post(self, request, *args, **kwargs):
        raw_token = uuid.uuid4().hex
        signed_token = signer.sign(raw_token)

        cache.set(f"auth:qr:{raw_token}", {"status": "pending", "created_at": timezone.now().isoformat()},
                  timeout=120, )

        qr_image = _generate_qr_image_base64(signed_token)

        data = {"token": raw_token, "qr_image": qr_image}
        serializer = QRLoginRequestResponseSerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(tags=["Auth"])
class QRCodeLoginAuthorizeView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def post(self, request, *args, **kwargs):
        serializer = QRLoginAuthorizeRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        signed_token = serializer.validated_data["token"]
        try:
            raw_token = signer.unsign(signed_token, max_age=120)
        except (SignatureExpired, BadSignature):
            return Response({"detail": "QR kod eskirgan yoki noto'g'ri."})

        key = f"auth:qr:{raw_token}"
        payload = cache.get(key)

        if not payload:
            return Response({"detail": "Token topilmadi yoki eskirgan."})

        cache.set(key, {"status": "approved", "user_id": request.user.id}, timeout=60)
        return Response({"status": "Success"})


@extend_schema(tags=["Auth"])
class QRCodeLoginStatusView(APIView):
    pagination_class = None
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        token = request.query_params.get("token")
        if not token:
            return Response({"detail": "token is required"})

        key = f"auth:qr:{token}"
        payload = cache.get(key)

        if not payload:
            return Response({"status": "expired"})

        if payload.get("status") == "approved":
            user_id = payload.get("user_id")

            user = User.objects.get(id=user_id)

            refresh = RefreshToken.for_user(user)
            cache.delete(key)

            serializer = QRLoginStatusResponseSerializer(
                {"status": "approved", "access": str(refresh.access_token), "refresh": str(refresh), })
            return Response(serializer.data)

        return Response({"status": "pending"})
