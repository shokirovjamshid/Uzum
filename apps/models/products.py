from django.db.models import BigIntegerField, FileField, UniqueConstraint
from django.db.models import JSONField
from django.db.models import Model, ImageField, ForeignKey, CASCADE, IntegerChoices, SET_NULL
from django.db.models import OneToOneField, SmallIntegerField
from django.db.models import PositiveIntegerField
from django.db.models.fields import CharField, SlugField, URLField
from django.db.models.fields import PositiveBigIntegerField, FloatField
from django.db.models.fields import PositiveSmallIntegerField, TextField, BooleanField
from django.utils.text import slugify
from django_ckeditor_5.fields import CKEditor5Field
from django_jsonform.models.fields import ArrayField
from mptt.fields import TreeForeignKey
from mptt.models import MPTTModel

from apps.models.base import CreatedBaseModel
from apps.models.base import ImageBaseModel
from apps.models.base import SlugBaseModel
from apps.models.utils import quality_assessment_validate
from apps.models.utils import validate_video


class Category(MPTTModel, ImageBaseModel):
    name = CharField(max_length=255)
    parent = TreeForeignKey('self', on_delete=CASCADE, null=True, blank=True, related_name='subcategory')
    slug = SlugField(max_length=255, unique=True, editable=False)
    deeplink = URLField(null=True, blank=True)
    product_amount = PositiveIntegerField(default=0, editable=False)
    attribute = JSONField(null=True, blank=True)
    path = ArrayField(PositiveIntegerField(), default=list, editable=False)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            super().save(*args, **kwargs)
            self.slug = f"{base_slug}-{self.id}"
            kwargs['update_fields'] = ['slug']
        parent_ids = list(self.get_ancestors(include_self=True).values_list('id', flat=True))
        if self.path != parent_ids:
            self.path = parent_ids
            kwargs['update_fields'] += ['path']
        super().save(*args, **kwargs)


class Product(CreatedBaseModel, SlugBaseModel):
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


class Favorite(CreatedBaseModel):
    product = ForeignKey('apps.Product', CASCADE, related_name='favorites')
    quantity = PositiveIntegerField(default=1)
    user = ForeignKey('apps.User', CASCADE, related_name='favorites')

    class Meta:
        unique_together = ('product', 'user')


class Cart(Model):
    user = OneToOneField('apps.User', CASCADE, related_name='cart')


class CartItem(CreatedBaseModel):
    product = ForeignKey('apps.Product', on_delete=SET_NULL, null=True)
    quantity = SmallIntegerField(default=1)
    cart = ForeignKey('apps.Cart', CASCADE, related_name='cart_items')


class Comment(CreatedBaseModel):
    class Status(IntegerChoices):
        REJECTED = 0, 'Rejected'
        PUBLISHED = 1, 'Published'

    product = ForeignKey('apps.Product', CASCADE, related_name='comments')
    quality_assessment = PositiveSmallIntegerField(validators=[quality_assessment_validate])
    user = ForeignKey('apps.User', SET_NULL, related_name='comments', null=True)
    service_evaluation = PositiveSmallIntegerField(validators=[quality_assessment_validate])
    delivery_speed_assessment = PositiveSmallIntegerField(validators=[quality_assessment_validate])
    advantages = TextField()
    disadvantages = TextField()
    comment = TextField()
    status = PositiveSmallIntegerField(choices=Status.choices)
    is_anonymous = BooleanField(default=False)


class CommentImage(Model):
    image = ImageField(upload_to='comment/images/%Y/%m/%d')
    comment = ForeignKey('apps.Comment', CASCADE, related_name='images')
