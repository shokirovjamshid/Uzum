from io import BytesIO

from PIL import Image
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import InMemoryUploadedFile, TemporaryUploadedFile
from django.core.validators import FileExtensionValidator
from django.db.models import Model, SlugField, DateTimeField, ImageField
from django.utils.text import slugify

from apps.models.utils import upload_to_image, upload_image_size_5mb_validator


class SlugBaseModel(Model):
    slug = SlugField(max_length=300, unique=True, editable=True)

    class Meta:
        abstract = True

    def save(self, *, force_insert=False, force_update=False, using=None, update_fields=None):
        if hasattr(self, 'title'):
            self.slug = slugify(self.title)
        if hasattr(self, 'name'):
            self.slug = slugify(self.name)
        super().save(force_insert=force_insert, force_update=force_update, using=using, update_fields=update_fields)


class CreatedBaseModel(Model):
    created_at = DateTimeField(auto_now=True, editable=True)
    updated_at = DateTimeField(auto_now_add=True, editable=True)

    class Meta:
        abstract = True


class ImageBaseModel(Model):
    image = ImageField(upload_to=upload_to_image, null=True, blank=True,
                       validators=[FileExtensionValidator(['jpg', 'jpeg', 'png', 'webp']),
                                   upload_image_size_5mb_validator])
    def convert_img_to_webp(self):
        is_new_upload = isinstance(self.image.file, (InMemoryUploadedFile, TemporaryUploadedFile))

        if self._state.adding or is_new_upload:
            img = Image.open(self.image)
            img = img.convert("RGB")
            buffer = BytesIO()
            img.save(buffer, format="WEBP", quality=85)
            buffer.seek(0)

            self.image = ContentFile(buffer.read(), f"{self.image.name.split('.')[0]}.webp")
            buffer.close()

    def save(self, *, force_insert=False, force_update=False, using=None, update_fields=None):
        if self.image:
            self.convert_img_to_webp()
        super().save(force_insert=force_insert, force_update=force_update, using=using, update_fields=update_fields)
