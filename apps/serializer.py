from django.core.cache import cache
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.fields import IntegerField, CharField
from rest_framework.serializers import ModelSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from apps.models import Category, User, Product
from apps.models import City, DeliveryPoint, Weekday
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


class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'children', 'slug']

    def get_children(self, obj):
        return CategorySerializer(obj.subcategory.all(), many=True).data


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
        fields = 'name', 'rating', 'comment_count',

    def to_representation(self, instance: Product):
        re = super().to_representation(instance)
        re['price'] = instance.product_items.first().price
        re['image'] = instance.images.first()
        return re

