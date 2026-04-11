from datetime import timedelta

from django.utils.timezone import now
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.fields import CharField, ChoiceField, IntegerField, HiddenField, CurrentUserDefault, \
    SerializerMethodField
from rest_framework.serializers import ModelSerializer, Serializer
from rest_framework_simplejwt.tokens import RefreshToken

from apps.models import City, DeliveryPoint, Weekday, Favorite, Product, Shop, Category, User, Comment, \
    CommentImage, OrderItem, CartItem, ProductVariant
from apps.models.chats import Message, ChatRoom
from apps.models.products import AttributeValue, Attribute
from apps.models.utils import uz_phone_validator
from apps.tasks import register_key
from root.settings import r


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
    class Meta:
        model = Message
        fields = ('id', 'chat', 'sender', 'text', 'image', 'created_at', 'is_read')


class ChatRoomModelSerializer(ModelSerializer):
    class Meta:
        model = ChatRoom
        fields = '__all__'
        ordering = 'last_message_at',

    def to_representation(self, instance: ChatRoom):
        repr = super().to_representation(instance)
        repr['last_message_at'] = instance.last_message_at.date() if instance.last_message_at + timedelta(
            days=1) < now() else instance.last_message_at.time().strftime('%H:%M')
        last_message = instance.messages.order_by('-created_at').first().text
        repr['last_message'] = last_message if last_message else '🌄'
        repr['message_not_read_count'] = instance.messages.filter(is_read=False).count()
        return repr


class ChatRoomSerializer(ModelSerializer):
    last_message = SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = ('id', 'buyer', 'shop', 'last_message_at', 'last_message',)

    def get_last_message(self, obj):
        message = getattr(
            obj,
            "_last_message",
            None) or obj.messages.order_by('-created_at').first()
        if not message:
            return None
        return MessageSerializer(message).data


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


class ProductVariantSerializer(ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = '__all__'


class ProductModelSerializer(DynamicFieldsModelSerializer):
    product_variants = ProductVariantSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = 'id', 'name', 'rating', 'comments_count', "slug", "product_variants", 'shop',

    def to_representation(self, instance: Product):
        re = super().to_representation(instance)
        request = self.context.get('request')
        first_image = instance.images.first()
        if first_image and first_image.image:
            try:
                re['image'] = first_image.image.url
            except (ValueError, AttributeError):
                re['image'] = None
        else:
            re['image'] = None

        if request and request.user.is_authenticated:
            re['is_favorite'] = Favorite.objects.filter(user=request.user, product=instance).exists()
        else:
            re['is_favorite'] = False
        if hasattr(instance, 'product_items') and instance.product_items.exists():
            re['price'] = instance.product_items.first().price
        else:
            re['price'] = getattr(instance, 'price', 0)
        if hasattr(instance, 'product_items') and instance.product_items.exists():
            first_variant = instance.product_items.first()
            re['discount_price'] = getattr(first_variant, 'price_delta', None)
        else:
            re['discount_price'] = getattr(instance, 'discount_price', None)
        if instance.shop:
            shop_image = None
            if instance.shop.image:
                try:
                    shop_image = instance.shop.image.url
                except (ValueError, AttributeError):
                    shop_image = None
            re['shop'] = {
                'id': instance.shop.id,
                'name': instance.shop.name,
                'slug': instance.shop.slug,
                'image': shop_image,
                'rating': instance.shop.rating
            }
        else:
            re['shop'] = None

        return re

class ShopModelSerializer(ModelSerializer):
    class Meta:
        model = Shop
        fields = '__all__'


class CartItemModelSerializer(DynamicFieldsModelSerializer):
    user = HiddenField(default=CurrentUserDefault())

    class Meta:
        model = CartItem
        fields = 'user', 'product', 'quantity'
        extra_kwargs = {
            'product': {'read_only': True},
            'quantity': {'write_only': True},
        }

    def to_representation(self, instance):
        repr = super().to_representation(instance)
        user = self.context['request'].user
        repr.update(**ProductModelSerializer(instance.product,
                                             context={'request': self.context.get('request')}).data)
        repr['seller_name'] = instance.product.shop.name
        repr['is_favorite'] = Favorite.objects.filter(user=user, product=instance.product).exists()
        card_item = CartItem.objects.filter(card__user=user, product=instance.product).only('quantity').first()
        if card_item:
            repr['quantity'] = card_item.quantity
        else:
            repr['quantity'] = 0
        return repr


class CartListSerializer(DynamicFieldsModelSerializer):
    user = HiddenField(default=CurrentUserDefault())
    product_detail = ProductModelSerializer(source='product', read_only=True)

    class Meta:
        model = CartItem
        fields = 'user', 'product', 'quantity', 'product_detail'


class FavoriteListProductModelSerializer(DynamicFieldsModelSerializer):
    user = HiddenField(default=CurrentUserDefault())
    is_favorite = serializers.BooleanField(read_only=True)
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), write_only=True)
    product_detail = ProductModelSerializer(source='product', read_only=True)

    class Meta:
        model = Favorite
        fields = 'id', 'user', 'product', 'product_detail', 'is_favorite'
        validators = []

    def create(self, validated_data):
        from django.db import IntegrityError
        product = validated_data.get('product')
        user = validated_data.get('user')
        try:
            obj = self.Meta.model.objects.create(product=product, user=user)
            self._is_favorite = True
            return obj
        except IntegrityError:
            existing = self.Meta.model.objects.get(product=product, user=user)
            existing.delete()
            self._is_favorite = False
            self._deleted_instance = existing
            return self.Meta.model(product=product, user=user)

    def to_representation(self, instance):
        repr = super().to_representation(instance)
        repr['is_favorite'] = getattr(self, '_is_favorite', True)
        if not repr['is_favorite']:
            repr['id'] = None
            repr['product'] = None
        return repr


class FavoriteRetrieveProductSerializer(DynamicFieldsModelSerializer):
    user = HiddenField(default=CurrentUserDefault())
    product = ProductModelSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = 'id', 'user', 'product'

    def to_representation(self, instance):
        repr = super().to_representation(instance)
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            cart_item = CartItem.objects.filter(
                cart__user=request.user, product=instance.product).only('quantity').first()
            if cart_item:
                repr['quantity'] = cart_item.quantity
            else:
                repr['quantity'] = 0
        else:
            repr['quantity'] = 0
        repr['is_favorite'] = True
        return repr


class CategoryModelSerializer(ModelSerializer):
    children = SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'children', 'deeplink']

    def get_children(self, obj: Category):
        children = obj.get_children()
        if children:
            return CategoryModelSerializer(children, many=True).data
        return []


class AttributeValueSerializer(ModelSerializer):
    class Meta:
        model = AttributeValue
        fields = ['id', 'value']


class AttributeSerializer(ModelSerializer):
    class Meta:
        model = Attribute
        fields = ['id', 'name', ]

    def to_representation(self, instance: Attribute):
        repr = super().to_representation(instance)
        attrs = instance.values.all()
        repr['values'] = AttributeValueSerializer(attrs, many=True).data if attrs else []
        return repr


class CategoryDetailModelSerializer(ModelSerializer):
    children = SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'children', 'deeplink']

    def get_children(self, obj: Category):
        children = obj.get_children()
        if children:
            return CategoryDetailModelSerializer(children, many=True).data
        return []

    def to_representation(self, instance: Category):
        repr = super().to_representation(instance)
        attrs = instance.attribute_value.all()
        repr["attributes"] = AttributeSerializer(attrs, many=True).data if attrs else []
        return repr


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


class ShopRetrieveUpdateDestroySerializer(ModelSerializer):
    class Meta:
        model = Shop
        fields = 'id', 'slug', 'name', 'banner', 'rating', 'description', "image", 'order_count', 'created_at', 'comment_count'


class ShopListCreateSerializer(ModelSerializer):
    class Meta:
        model = Shop
        fields = 'id', 'slug', 'name', 'image', 'rating', 'comment_count', 'description', 'banner'


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
