from django.db.models import CASCADE
from django.db.models.fields import CharField, SlugField
from django.utils.text import slugify
from mptt.fields import TreeForeignKey
from mptt.models import MPTTModel


class Category(MPTTModel):
    name = CharField(max_length=255)
    parent = TreeForeignKey('self', on_delete=CASCADE, null=True, blank=True, related_name='subcategory')
    slug = SlugField(max_length=255, unique=True, editable=False)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            super().save(*args, **kwargs)
            self.slug = f"{base_slug}-{self.id}"
            kwargs['update_fields'] = ['slug']
        super().save(*args, **kwargs)
