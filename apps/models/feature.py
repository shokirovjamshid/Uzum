from django.db.models import Model, CharField, ForeignKey, CASCADE, FileField, SET_NULL

from apps.models.base import ImageBaseModel
from apps.models.utils import validate_video


class ProductModel(Model):
    name = CharField(max_length=50)
    category = ForeignKey('apps.Category', on_delete=CASCADE, related_name='product_models')


class Brand(Model):
    title = CharField(max_length=100)
    category = ForeignKey('apps.Category', on_delete=CASCADE, related_name='product_brands')


class Country(Model):
    name = CharField(max_length=50)


# from django.db.models import Model, CharField, ForeignKey, CASCADE, FileField, SET_NULL
#
# from apps.models.base import ImageBaseModel
# from apps.models.utils import validate_video
#
#
# class ProductModel(Model):
#     name = CharField(max_length=50)
#     category = ForeignKey('apps.Category', on_delete=CASCADE, related_name='product_models')
#
#
# class Brand(Model):
#     title = CharField(max_length=100)
#     category = ForeignKey('apps.Category', on_delete=CASCADE, related_name='product_brands')
#
#
# class Country(Model):
#     name = CharField(max_length=50)
#
#
# class ProductImage(ImageBaseModel):
#     product = ForeignKey('apps.Product', on_delete=CASCADE, related_name='images')
#
#
# class ProductVideo(Model):
#     video = FileField(upload_to='product/videos/', validators=[validate_video])
#     product = ForeignKey('apps.Product', on_delete=CASCADE, related_name='videos')
#
#
# class Color(Model):
#     name = CharField(max_length=50)
#
#
# class Ram(Model):
#
#
#
# class ProductColor(Model):
#     color = ForeignKey('apps.Color', on_delete=SET_NULL)
#     product = ForeignKey('apps.Product', CASCADE, related_name='colors')


class ProductImage(ImageBaseModel):
    product = ForeignKey('apps.Product', on_delete=CASCADE, related_name='images')


class ProductVideo(Model):
    video = FileField(upload_to='product/videos/', validators=[validate_video])
    product = ForeignKey('apps.Product', on_delete=CASCADE, related_name='videos')


class Color(Model):
    name = CharField(max_length=50)


class Ram(Model):
    pass


class ProductColor(Model):
    color = ForeignKey('apps.Color', on_delete=SET_NULL)
    product = ForeignKey('apps.Product', CASCADE, related_name='colors')


class ProductRam(Model):
    pass

# class ProductRam(Model):
#     pass
