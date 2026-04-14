from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.fields import CharField, ChoiceField, IntegerField
from rest_framework.serializers import ModelSerializer, Serializer
from rest_framework_simplejwt.tokens import RefreshToken

from apps.models import User
from apps.models.utils import uz_phone_validator
from apps.tasks import register_key
from root.settings import r


class RegisterModelSerializer(ModelSerializer):
    phone = CharField(max_length=12, validators=[uz_phone_validator])
    code = IntegerField(min_value=100000, max_value=999999, write_only=True)

    class Meta:
        model = User
        fields = 'phone', 'code'

    def validate(self, attrs):
        phone = attrs.get('phone')
        code = attrs.pop('code')
        key = register_key(phone)
        is_available_code = r.get(key)
        remaining_time = r.ttl(key)

        # Handle expired or missing code
        if not is_available_code:
            raise ValidationError("Tasdiqlash kodi muddati tugagan yoki yuborilmagan")

        # Handle wrong code
        if str(is_available_code) != str(code):
            # Check if code still has time remaining
            if remaining_time > 0:
                raise ValidationError(
                    f"Noto'g'ri kod. Iltimos, to'g'ri kodni kiriting. "
                    f"Qolgan vaqt: {remaining_time // 60}:{remaining_time % 60:02d}"
                )
            else:
                raise ValidationError("Tasdiqlash kodi muddati tugagan. Iltimos, yangi kod oling")

        return super().validate(attrs)

    def create(self, validated_data):
        phone = validated_data.get('phone')
        user, _ = self.Meta.model.objects.get_or_create(**validated_data)
        r.delete(register_key(phone))
        return user

    def to_representation(self, instance: User):
        re = super().to_representation(instance)
        refresh = RefreshToken.for_user(instance)
        re['id'] = instance.id
        re['phone'] = instance.phone
        re['first_name'] = instance.first_name
        re['last_name'] = instance.last_name
        re['type'] = instance.type
        re['data'] = {
            'refresh token': str(refresh),
            'access token': str(
                refresh.access_token)}
        return re


class UserUpdateModelSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = 'first_name', 'last_name', 'email'
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'email': {'required': False},
        }

    def validate_email(self, value):
        if value is None or value == '':
            return value
        user = self.instance
        if User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise ValidationError("user with this email already exists.")
        return value


class QRLoginRequestResponseSerializer(Serializer):
    token = CharField(
        help_text="Statusni tekshirish uchun ishlatiladigan UUID")
    qr_image = CharField(help_text="Base64 formatidagi QR rasm")


class QRLoginAuthorizeRequestSerializer(serializers.Serializer):
    token = CharField(
        help_text="QR koddan o'qib olingan imzolangan (signed) token")

    def validate_token(self, value):
        if not value:
            raise serializers.ValidationError(
                "Token bo'sh bo'lishi mumkin emas.")
        return value


class QRLoginStatusResponseSerializer(Serializer):
    status = ChoiceField(
        choices=[
            "pending",
            "approved",
            "expired"],
        help_text="Login holati")
    access = CharField(required=False, allow_null=True)
    refresh = CharField(required=False, allow_null=True)

    def validate(self, data):
        if data.get("status") == "approved":
            if not data.get("access") or not data.get("refresh"):
                raise serializers.ValidationError(
                    "Tasdiqlangan login uchun tokenlar taqdim etilishi shart.")
        return data
