from django.core.cache import cache
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.fields import CharField, ChoiceField, SerializerMethodField, IntegerField, HiddenField, \
    CurrentUserDefault
from rest_framework.serializers import ModelSerializer, Serializer
from rest_framework_simplejwt.tokens import RefreshToken

from apps.models import City, DeliveryPoint, Weekday, Favorite, Product, Shop, Category, User, Comment, \
    CommentImage, OrderItem
from apps.models.chats import Message, ChatRoom
from apps.models.utils import uz_phone_validator
from apps.tasks import register_key


class CityListModelSerializer(ModelSerializer):
    class Meta:
        model = City
        fields = '__all__'


class WeekdayModelSerializer(ModelSerializer):
    class Meta:
        model = Weekday
        fields = 'day', 'working_hours'


class DeliveryPointsListModelSerializer(ModelSerializer):
    weekdays = WeekdayModelSerializer(many=True)

    class Meta:
        model = DeliveryPoint
        fields = 'address', 'has_dressing_room', 'weekdays', 'location'


class DeliveryPointsRetrieveModelSerializer(ModelSerializer):
    weekdays = WeekdayModelSerializer(many=True)

    class Meta:
        model = DeliveryPoint
        fields = 'address', 'has_dressing_room', 'weekdays', 'location', 'order_retention_period'


class MessageSerializer(ModelSerializer):
    sender_type = CharField(source='sender.type', read_only=True)

    class Meta:
        model = Message
        fields = ('id', 'chat', 'sender', 'sender_type', 'text', 'image_url', 'timestamp', 'is_read', 'read_at',)


class ChatRoomListSerializer(Serializer):
    partner_name = SerializerMethodField()
    partner_image = SerializerMethodField()
    last_message = SerializerMethodField()
    unread_count = IntegerField(read_only=True)

    class Meta:
        model = ChatRoom
        fields = ['id', 'partner_name', 'partner_image', 'last_message', 'unread_count', 'last_message_at']

    def get_partner_name(self, obj):
        user = self.context['request'].user
        if obj.buyer == user:
            return obj.store.name
        return obj.buyer.phone

    def get_partner_image(self, obj):
        user = self.context['request'].user
        if obj.buyer == user:
            return obj.store.logo.url if obj.store.logo else None
        return None

    def get_last_message(self, obj):
        last_msg = getattr(obj, 'latest_message', None)
        if last_msg:
            return last_msg[0].text if last_msg[0].text else "Rasm yuborildi"
        return None


class ChatRoomSerializer(ModelSerializer):
    last_message = SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = ('id', 'buyer', 'shop', 'last_message_at', 'last_message',)

    def get_last_message(self, obj):
        message = getattr(obj, "_last_message", None) or obj.messages.order_by('-timestamp').first()
        if not message:
            return None
        return MessageSerializer(message).data


class QRLoginRequestResponseSerializer(Serializer):
    token = CharField(help_text="Statusni tekshirish uchun ishlatiladigan UUID")
    qr_image = CharField(help_text="Base64 formatidagi QR rasm")


class QRLoginAuthorizeRequestSerializer(serializers.Serializer):
    token = CharField(help_text="QR koddan o'qib olingan imzolangan (signed) token")

    def validate_token(self, value):
        if not value:
            raise serializers.ValidationError("Token bo'sh bo'lishi mumkin emas.")
        return value


class QRLoginStatusResponseSerializer(Serializer):
    status = ChoiceField(choices=["pending", "approved", "expired"], help_text="Login holati")
    access = CharField(required=False, allow_null=True)
    refresh = CharField(required=False, allow_null=True)

    def validate(self, data):
        if data.get("status") == "approved":
            if not data.get("access") or not data.get("refresh"):
                raise serializers.ValidationError("Tasdiqlangan login uchun tokenlar taqdim etilishi shart.")
        return data


class DynamicFieldsModelSerializer(ModelSerializer):
    """
    A ModelSerializer that takes an additional `fields` argument that
    controls which fields should be displayed.
    """

    def __init__(self, *args, **kwargs):
        # Don't pass the 'fields' arg up to the superclass
        fields = kwargs.pop('fields', None)

        # Instantiate the superclass normally
        super().__init__(*args, **kwargs)

        if fields is not None:
            # Drop any fields that are not specified in the `fields` argument.
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)


class ProductModelSerializer(DynamicFieldsModelSerializer):
    class Meta:
        model = Product
        fields = 'name', 'slug', 'price', 'rating'


class ShopModelSerializer(ModelSerializer):
    class Meta:
        model = Shop
        fields = '__all__'


class FavoriteProductModelSerializer(DynamicFieldsModelSerializer):
    user = HiddenField(default=CurrentUserDefault())

    class Meta:
        model = Favorite
        fields = 'id', 'user', 'product'

    def save(self, **kwargs):
        product = kwargs.get('product')
        user = kwargs.get('user')
        obj, created = self.Meta.model.objects.get_or_create(product=product, user=user)
        if not created:
            obj.delete()
            return Favorite(user=user, product=product)
        return obj


class CategoryModelSerializer(ModelSerializer):
    children = SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'children', 'deeplink']

    def get_children(self, obj):
        children = obj.get_children()
        if children:
            return CategoryModelSerializer(children, many=True).data
        return []


class RegisterSerializer(ModelSerializer):
    phone = CharField(max_length=12, validators=[uz_phone_validator])
    code = IntegerField(min_value=100000, max_value=999999, write_only=True)

    class Meta:
        model = User
        fields = 'phone', 'code'

    def validate(self, attrs):
        phone = attrs.get('phone')
        code = attrs.pop('code')
        if cache.get(register_key(phone)) != code:
            raise ValidationError("Noto'g'ri kode")
        return super().validate(attrs)

    def create(self, validated_data):
        user, _ = self.Meta.model.objects.get_or_create(**validated_data)
        return user

    def to_representation(self, instance: User):
        re = super().to_representation(instance)
        refresh = RefreshToken.for_user(instance)
        re['data'] = {'refresh token': str(refresh), 'access token': str(refresh.access_token)}
        return re


class ProductListSerializer(ModelSerializer):
    class Meta:
        model = Product
        fields = 'name', 'rating', 'comments_count',

    def to_representation(self, instance: Product):
        re = super().to_representation(instance)
        re['price'] = instance.product_items.first().price
        re['image'] = instance.images.first()
        return re


class ShopRetrieveUpdateDestroySerializer(ModelSerializer):
    class Meta:
        model = Shop
        fields = 'name', 'banner', 'rating', 'description', "image", 'order_count', 'created_at', 'comment_count'


class ShopListCreateSerializer(ModelSerializer):
    class Meta:
        model = Shop
        fields = 'name', 'image', 'rating', 'comment_count', 'description', 'banner'


class CommentListModelSerializer(ModelSerializer):
    class Meta:
        model = Comment
        exclude = 'is_anonymous', 'service_evaluation', 'delivery_speed_assessment', 'status', 'user', 'product'


class CommentImageSerializer(ModelSerializer):
    class Meta:
        model = CommentImage
        fields = ["id", "image"]


class CommentCreateModelSerializer(ModelSerializer):
    user = HiddenField(default=CurrentUserDefault())
    images = CommentImageSerializer()

    class Meta:
        model = Comment
        fields = 'user', 'product', 'user_name', 'quality_assessment', 'service_evaluation', 'delivery_speed_assessment', 'advantages', 'disadvantages', 'comment', 'is_anonymous', 'images'

    def validate(self, attrs):
        user = attrs.get('user')
        product = attrs.get('product')
        if not OrderItem.objects.filter(product=product, order__user=user).exists():
            raise ValidationError('Siz kommit yoza olmaysiz')
        return super().validate(attrs)

    def create(self, validated_data):
        images = validated_data.pop('images')
        is_anonymous = validated_data.get('is_anonymous')
        user = validated_data.get('user')
        user_name = 'Anonim'
        if not is_anonymous:
            user_name = user.first_name
        comments = self.Meta.model.objects.create(**validated_data, user_name=user_name)
        comments_list = [CommentImage(comment=comments, image=image) for image in images]
        CommentImage.objects.bulk_create(comments_list)
        return comments
