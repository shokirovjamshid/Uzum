from django.db.models import CASCADE, JSONField
from django.db.models.fields import CharField, SlugField, URLField, PositiveIntegerField
from django.utils.text import slugify
from django_jsonform.models.fields import ArrayField
from mptt.fields import TreeForeignKey
from mptt.models import MPTTModel

from apps.models.base import ImageBaseModel


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
