from django.db.models import ForeignKey, SET_NULL, CASCADE, CharField, Model, BigIntegerField, SlugField, \
    FileField, UniqueConstraint
from django.db.models.fields import PositiveSmallIntegerField, PositiveBigIntegerField, FloatField
from django_ckeditor_5.fields import CKEditor5Field
from django_jsonform.models.fields import JSONField

from apps.models.base import CreatedBaseModel, ImageBaseModel
from apps.models.utils import validate_video


class Product(CreatedBaseModel):
    name = CharField(max_length=90)
    category = ForeignKey('apps.Category', on_delete=CASCADE, related_name='products')
    guarantee = PositiveSmallIntegerField(null=True, blank=True, default=6)
    shop = ForeignKey('apps.Shop', CASCADE, related_name='products')
    # tovar belgisi
    model = ForeignKey('apps.ProductModel', on_delete=SET_NULL, related_name='products', null=True, blank=True)
    brand = ForeignKey('apps.Brand', on_delete=SET_NULL, related_name='products', null=True, blank=True)
    country = ForeignKey('apps.Country', on_delete=SET_NULL, related_name='products', null=True, blank=True)
    description = CKEditor5Field()
    sku = CharField(max_length=100)
    comments_count = PositiveSmallIntegerField(default=0)
    price = BigIntegerField()
    # 360 gradusli rasm
    short_description = CharField(max_length=390)
    rating = FloatField(default=0)

    class Meta:
        constraints = [
            UniqueConstraint(
                fields=['sku', 'shop'],
                name='unique_sku_shop'
            )
        ]


class ProductItem(Model):
    feature = JSONField()
    quantity = PositiveSmallIntegerField(default=1)
    price = BigIntegerField()
    slug = SlugField(max_length=255, unique=True, editable=False)
    product = ForeignKey('apps.Product', CASCADE, related_name='product_items')
    price_delta = PositiveBigIntegerField(null=True, blank=True)
    sku = CharField(max_length=7)
    attribute = JSONField()


class ProductImage(ImageBaseModel):
    product_item = ForeignKey('apps.ProductItem', CASCADE, related_name='images', null=True, blank=True)
    product = ForeignKey('apps.Product', CASCADE, related_name='images', null=True, blank=True)


class ProductVideo(Model):
    video = FileField(upload_to='product/videos/%Y/%m/%d', null=True, blank=True, validators=[validate_video])
    product_item = ForeignKey('apps.ProductItem', CASCADE, related_name='videos', blank=True, null=True)
    product = ForeignKey('apps.Product', CASCADE, related_name='videos', blank=True, null=True)


