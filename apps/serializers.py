from rest_framework import serializers
from rest_framework.fields import CharField, ChoiceField, SerializerMethodField, DecimalField, IntegerField
from rest_framework.serializers import ModelSerializer, Serializer

from apps.models import City, DeliveryPoint, Weekday, ChatRoom, Message, Product, ProductVariantModel


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


class ProductSerializer(Serializer):
    class Meta:
        model = Product
        fields = ("id", "name_uz", "short_description_uz", "description_uz", "features_uz", "brand", "country", "model",)


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
        fields = ('id', 'buyer', 'store', 'last_message_at', 'last_message',)

    def get_last_message(self, obj):
        message = getattr(obj, "_last_message", None) or obj.messages.order_by('-timestamp').first()
        if not message:
            return None
        return MessageSerializer(message).data


class QRLoginRequestResponseSerializer(Serializer):
    token = CharField(help_text="Statusni tekshirish uchun ishlatiladigan UUID")
    qr_image = CharField(help_text="Base64 formatidagi QR rasm")


class QRLoginAuthorizeRequestSerializer(serializers.Serializer):
    token = CharField(
        help_text="QR koddan o'qib olingan imzolangan (signed) token"
    )

    def validate_token(self, value):
        if not value:
            raise serializers.ValidationError("Token bo'sh bo'lishi mumkin emas.")
        return value


class QRLoginStatusResponseSerializer(Serializer):
    status = ChoiceField(
        choices=["pending", "approved", "expired"],
        help_text="Login holati"
    )
    access = CharField(required=False, allow_null=True)
    refresh = CharField(required=False, allow_null=True)

    def validate(self, data):
        if data.get("status") == "approved":
            if not data.get("access") or not data.get("refresh"):
                raise serializers.ValidationError("Tasdiqlangan login uchun tokenlar taqdim etilishi shart.")
        return data


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariantModel
        fields = ['price', 'stock', 'attributes_cache',]

class ProductListSerializer(ModelSerializer):
    starting_price = DecimalField(max_digits=15, decimal_places=2, read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name_uz', 'slug', 'brand_name', 'starting_price']

class ProductReadSerializer(ModelSerializer):
    variants = SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name_uz', 'slug', 'category', 'brand', 'variants']

    def get_variants(self, obj) -> list:
        variants = getattr(obj, 'all_variants', obj.variants.all())
        return [{
            "skuId": v.sku_id,
            "price": v.price,
            "stock": v.stock,
            "attributes": v.attributes_cache,
            "variant_slug": v.variant_slug
        } for v in variants]


class ProductCreateSerializer(serializers.ModelSerializer):
    variants = ProductVariantSerializer(many=True)

    class Meta:
        model = Product
        fields = ['name_uz', 'slug', 'category', 'brand', 'variants']

    def create(self, validated_data):
        variants_data = validated_data.pop('variants')
        product = Product.objects.create(**validated_data)
        variant_objs = [
            ProductVariantModel(product=product, **variant_data)
            for variant_data in variants_data
        ]
        ProductVariantModel.objects.bulk_create(variant_objs)
        return product

class VariantUpdateSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = ProductVariantModel
        fields = ['id', 'price', 'stock', 'attributes_cache', ]
class ProductUpdateSerializer(serializers.ModelSerializer):
    variants = ProductVariantSerializer(many=True)

    class Meta:
        model = Product
        fields = ['name_uz', 'slug', 'category', 'brand', 'variants']

    def update(self, instance, validated_data):
        variants_data = validated_data.pop('variants', [])
        instance.name_uz = validated_data.get('name_uz', instance.name_uz)
        instance.category = validated_data.get('category', instance.category)
        instance.brand = validated_data.get('brand', instance.brand)
        instance.save()

        existing_variants = {v.id: v for v in instance.variants.all()}
        new_variants_to_create = []

        for variant_item in variants_data:
            variant_id = variant_item.get('id')

            if variant_id and variant_id in existing_variants:
                v_instance = existing_variants.pop(variant_id)
                for attr, value in variant_item.items():
                    setattr(v_instance, attr, value)
                v_instance.save()
            else:
                new_variants_to_create.append(
                    ProductVariantModel(product=instance, **variant_item)
                )

        if existing_variants:
            ProductVariantModel.objects.filter(id__in=existing_variants.keys()).delete()
        if new_variants_to_create:
            ProductVariantModel.objects.bulk_create(new_variants_to_create)
        return instance

class ProductDeleteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = []

class ProductListFilterSerializer(Serializer):
    brand_name = CharField(source='brand.name', read_only=True)

    starting_price = DecimalField(max_digits=15, decimal_places=2, read_only=True)
    main_image = serializers.SerializerMethodField()
    available_colors = serializers.SerializerMethodField()

    skus = SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name_uz', 'slug', 'brand_name',
            'starting_price', 'main_image', 'available_colors', 'skus'
        ]

    def get_main_image(self, obj):
        variant = getattr(obj, 'cheapest_variant', None)
        if variant:
            return variant[0].main_image.url if variant[0].main_image else None
        return None

    def get_available_colors(self, obj):
        colors = set()
        variants = getattr(obj, 'all_variants', obj.variants.all())
        for v in variants:
            color = v.attributes_cache.get('rang')  # 'rang' - bu Attribute slug
            if color:
                colors.add(color)
        return list(colors)

    def get_skus(self, obj):
        variants = getattr(obj, 'all_variants', obj.variants.all())
        return [
            {
                "skuId": v.sku_id,
                "price": v.price,
                "attributes": v.attributes_cache,
                "image": v.main_image.url if v.main_image else None
            } for v in variants
        ]
