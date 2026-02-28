from django.db.models import CharField, CASCADE, ManyToManyField
from mptt.fields import TreeForeignKey
from mptt.models import MPTTModel

from apps.models.base import SlugBaseModel


class Category(MPTTModel, SlugBaseModel):
    name = CharField(max_length=255)
    parent = TreeForeignKey('self', CASCADE, null=True, blank=True, related_name='subcategory')

