from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.fields import HiddenField, CurrentUserDefault, \
    SerializerMethodField
from rest_framework.serializers import ModelSerializer

from apps.models import City, DeliveryPoint, Weekday, Favorite, Product, Shop, Category, Comment, \
    CommentImage, OrderItem, CartItem, ProductVariant
from apps.models.products import AttributeValue, Attribute


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
        attrs = instance.attributes.all()
        repr["attributes"] = AttributeSerializer(attrs, many=True).data if attrs else []
        return repr
