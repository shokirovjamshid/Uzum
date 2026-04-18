from django.db.models import CASCADE, TextField, BooleanField, IntegerChoices, TextChoices, ImageField, \
    ManyToManyField, BigIntegerField
from django.db.models import ForeignKey, SET_NULL, Model, FileField
from django.db.models.fields import CharField, SlugField, URLField, PositiveIntegerField
from django.db.models.fields import PositiveSmallIntegerField, FloatField, DateTimeField
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.text import slugify
from django_ckeditor_5.fields import CKEditor5Field
from django_jsonform.models.fields import ArrayField
from mptt.fields import TreeForeignKey
from mptt.models import MPTTModel

from apps.models.base import CreatedBaseModel, SlugBaseModel
from apps.models.base import ImageBaseModel
from apps.models.utils import validate_video, quality_assessment_validate


class Category(MPTTModel, ImageBaseModel):  # ✅
    """
    Uzum: Chap panel → Katalog daraxtidagi kategoriyalar.
    Masalan: Elektronika > Telefonlar > Smartfonlar

    MPTTModel — daraxt (tree) strukturasi, cheksiz ichma-ich kategoriya.
    attributes M2M → shu kategoriyaga oid filtrlar (Rang, Xotira, RAM).
    """
    name = CharField(max_length=255)
    parent = TreeForeignKey('self', CASCADE, null=True, blank=True, related_name='subcategory')
    slug = SlugField(max_length=255, unique=True, editable=False)
    deeplink = URLField(null=True, blank=True)
    product_amount = PositiveIntegerField(default=0, editable=False)
    attributes = ManyToManyField("apps.Attribute", blank=True, related_name='categories')
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

    def __str__(self):
        return f"{self.name}"

    class Meta:
        verbose_name_plural = 'Categories'


class Attribute(Model):  # ✅
    """
    Uzum: Mahsulot sahifasidagi variant tanlash qatori.
    Masalan: "Rang" yoki "Xotira" degan sarlavha.

    type → 'IMAGE_WITH_TEXT': ranglar (kichik rasm + matn ko'rinishida)
           'TEXT': xotira, o'lcham kabi matnli variantlar
    """

    class Type(TextChoices):
        TEXT = 'TEXT', 'Text'
        IMAGE_WITH_TEXT = 'IMAGE_WITH_TEXT', 'Image with Text'

    name = CharField(max_length=255)
    type = CharField(max_length=20, choices=Type.choices, default=Type.TEXT)

    def __str__(self):
        return f"{self.name}"


class AttributeValue(Model):  # ✅
    """
    Uzum: Variant tanlash qatoridagi har bir tanlov tugmasi.
    Masalan: "Qora", "Yashil", "256GB", "8GB 128GB"

    color_code → faqat rang atributlari uchun (#000000, #0549be).
                 Rang bo'lmagan atributlarda (Xotira, RAM) null qoladi.
                 Rang doirasi (color swatch) shu hex kod orqali chiziladi.

    Slug yasashda rang AttributeValue.id ishlatiladi:
      smartfon-xiaomi-redmi-qora---{attr_value.id}-{product.id}
    """
    attribute = ForeignKey('apps.Attribute', CASCADE, related_name='values')
    value = CharField(max_length=255)
    color_code = CharField(max_length=10, null=True, blank=True)

    def __str__(self):
        return f"{self.attribute.name}: {self.value}"


class Brand(Model):  # ✅
    """
    Uzum: Mahsulot kartasidagi brend nomi va filter panelida "Brend" bo'limi.
    Masalan: Xiaomi, Apple, Samsung
    """
    title = CharField(max_length=100)

    def __str__(self):
        return self.title


class ProductModel(Model):  # ✅
    """
    Uzum: Brend ichidagi model qatori.
    Masalan: Xiaomi → Redmi Note 15, Redmi 14C
    """
    name = CharField(max_length=50)
    category = ForeignKey('apps.Category', CASCADE, related_name='models')

    def __str__(self):
        return f"{self.name}"


class ProductModelValue(Model):  # ✅
    """
    Uzum: ProductModel ga tegishli qo'shimcha qiymatlar.
    """
    product = ForeignKey('apps.ProductModel', CASCADE, related_name='values')
    value = CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return f"{self.value}"


class Product(CreatedBaseModel, SlugBaseModel):  # ✅
    """
    Uzum: Bitta mahsulot sahifasi (ProductGroup).
    URL dagi raqam — shu modelning ID si:
      uzum.uz/uz/product/smartfon-xiaomi-redmi-...-{product.id}

    Barcha ranglar va xotira variantlari shu Product ga biriktiriladi.
    Slug faqat mahsulot nomidan tuziladi, variant slug alohida yasaladi.
    """
    name = CharField(max_length=90)
    category = ForeignKey('apps.Category', CASCADE, related_name='products')
    guarantee = PositiveSmallIntegerField(null=True, blank=True, default=6)
    shop = ForeignKey('apps.Shop', CASCADE, related_name='products')
    model = ForeignKey('apps.ProductModel', SET_NULL, related_name='products', null=True, blank=True)
    brand = ForeignKey('apps.Brand', SET_NULL, related_name='products', null=True, blank=True)
    country = ForeignKey('apps.Country', SET_NULL, related_name='products', null=True, blank=True)
    description = CKEditor5Field()
    comments_count = PositiveIntegerField(default=0)
    orders_count = PositiveIntegerField(default=0)
    carts_count = PositiveIntegerField(default=0)

    instruction = CKEditor5Field(max_length=390)
    rating = FloatField(default=0)
    is_active = BooleanField(default=True)

    def __str__(self):
        return f"{self.name}"


class ProductHighlight(Model):  # ✅
    """
    Uzum: Mahsulot sahifasidagi qisqa afzalliklar (bullet point ro'yxati).
    Masalan:
      • 120 Gts AMOLED ekran — silliq tasvir va yorqin ranglar
      • 6000 mA·soatli kuchli batareya — 2 kungacha faol foydalanish
      • IP64 himoya — chang va suv tomchilaridan himoyalangan
    """
    product = ForeignKey('apps.Product', CASCADE, related_name='highlights')
    value = CharField(max_length=155)

    def __str__(self):
        return self.value


class ProductVariant(Model):
    """
    Uzum: Bitta SKU — mahsulotning aniq bir varianti.
    skuId URL parametri → shu modelning id si.

    Slug FORMATI (uzum.uz bilan bir xil):
      Rang atributi bor bo'lsa:
        {product_name}-{color_value}---{attr_value.id}-{product.id}
        Masalan: smartfon-xiaomi-redmi-qora---14-2288899

      Rang atributi yo'q bo'lsa (masalan, faqat xotira):
        {product_name}-{attr_values}-{product.id}
        Masalan: metall-izlagich-samdel03-2611954

    Narxlar:
      price          → asosiy to'liq narx (fullPrice)

    is_default → mahsulot sahifasi birinchi ochilganda ko'rinadigan variant
    """
    quantity = PositiveIntegerField(default=1)
    price = BigIntegerField()
    slug = SlugField(max_length=400, unique=True, editable=False)
    product = ForeignKey('apps.Product', CASCADE, related_name='product_items')
    sku = CharField(max_length=20)
    is_default = BooleanField(default=False)

    def update_slug(self):
        """
        Uzum formatida slug yaratadi.
        Rang atributi (IMAGE_WITH_TEXT) bo'lsa → rang nomi va uning ID si slug ga kiradi.
        Aks holda → barcha atribut qiymatlari slug ga qo'shiladi.
        """
        color_attr = (
            self.attr_variant
            .select_related('attribute', 'value')
            .filter(attribute__type='IMAGE_WITH_TEXT')
            .first()
        )

        if color_attr:
            color_part = f"{slugify(color_attr.value.value)}---{color_attr.value.id}"
        else:
            attr_values = list(
                self.attr_variant.select_related('value')
                .values_list('value__value', flat=True)
            )
            color_part = slugify('-'.join(attr_values)) if attr_values else self.sku

        new_slug = f"{slugify(self.product.name)}-{color_part}-{self.product.id}"

        if self.slug != new_slug:
            ProductVariant.objects.filter(pk=self.pk).update(slug=new_slug)
            self.slug = new_slug

    def save(self, *args, **kwargs):
        if not self.slug:
            # Atributlar hali biriktirilmagan — vaqtinchalik slug
            self.slug = slugify(f"{self.product.name}-{self.product.id}-{self.sku}")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product.name} [{self.sku}]"


class ProductVariantAttribute(Model):  # ✅
    """
    Uzum: Variant tanlash qatoridagi har bir atribut-qiymat bog'lanishi.
    Masalan: variant (SKU: 8193077) uchun:
      attribute=Xotira, value=8GB 128GB
      attribute=Xotira, value=16GB 256GB

    unique_together → bir variantda bir atribut faqat bir marta bo'lishi kerak.
    """
    product = ForeignKey('apps.ProductVariant', CASCADE, related_name='attr_variant')
    attribute = ForeignKey('apps.Attribute', CASCADE, related_name='variant_attributes')
    value = ForeignKey('apps.AttributeValue', CASCADE, related_name='variant_values')

    class Meta:
        unique_together = ('product', 'attribute')

    def __str__(self):
        return f"{self.attribute.name}: {self.value.value}"


@receiver(post_save, sender=ProductVariantAttribute)
def update_variant_slug_on_attribute_save(sender, instance, **kwargs):
    """Atribut qo'shilganda variant slugini avtomatik yangilaydi."""
    instance.product.update_slug()


class ProductImage(ImageBaseModel):  # ✅
    """
    Uzum: Mahsulot sahifasidagi asosiy rasm galereyasi
    (barcha variantlar uchun umumiy rasmlar).
    """
    product = ForeignKey('apps.Product', CASCADE, related_name='images')


class ProductVariantImage(ImageBaseModel):  # ✅
    """
    Uzum: Rang tanlanganda ko'rinadigan rasm galereyasi.
    Har bir rang variantining o'z rasmlari bor.
    Masalan: Qora rang → qora mahsulot rasmlari,
             Ko'k rang  → ko'k mahsulot rasmlari.
    """
    product = ForeignKey('apps.ProductVariant', CASCADE, related_name='variant_images', null=True, blank=True)


class ProductVideo(Model):  # ✅
    """
    Uzum: Mahsulot sahifasidagi video (mahsulot taqdimoti yoki ko'rsatma).
    Format: 1080x1440, hajmi 10 MB gacha.
    """
    video = FileField(upload_to='product/videos/%Y/%m/%d', null=True, blank=True, validators=[validate_video])
    product = ForeignKey('apps.Product', CASCADE, related_name='videos', blank=True, null=True)


class Comment(CreatedBaseModel):  # ✅
    """
    Uzum: Mahsulot sahifasidagi mijoz sharhlari bo'limi.
    rating            → 1-5 yulduz baholash
      Uzumdagi "Tovar sifati", "Xizmat ko'rsatish", "Yetkazib berish tezligi" baxolari
    advantages        → Ijobiy tomonlari
    disadvantages     → Salbiy tomonlari
    is_anonymous      → "Anonim" deb ko'rsatish
    """

    class Status(IntegerChoices):
        REJECTED = 0, 'Rejected'
        PUBLISHED = 1, 'Published'

    first_name = CharField(max_length=100)
    product = ForeignKey('apps.ProductVariant', CASCADE, related_name='comments')
    rating = PositiveSmallIntegerField(validators=[quality_assessment_validate])
    user = ForeignKey('apps.User', SET_NULL, related_name='comments', null=True)
    status = PositiveSmallIntegerField(choices=Status.choices, null=True, blank=True)
    advantages = TextField()
    disadvantages = TextField()
    comment = TextField()
    is_anonymous = BooleanField(default=False)


class CommentImage(Model):  # ✅
    """
    Uzum: Mijoz sharhiga biriktirilgan rasmlar.
    Sharh yozganda foydalanuvchi rasm yuklashi mumkin.
    """
    image = ImageField(upload_to='comment/images/%Y/%m/%d')
    comment = ForeignKey('apps.Comment', CASCADE, related_name='images')


class CommentReply(Model):  # ✅
    """
    Uzum: Seller (do'kon) mijoz sharhiga yozgan javob.
    Sharh ostida "Do'kon javobi:" ko'rinishida chiqadi.
    """
    comment = ForeignKey('apps.Comment', CASCADE, related_name='replies')
    shop = ForeignKey('apps.Shop', CASCADE, related_name='comment_replies')
    content = TextField()
    created_at = DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.shop} → {self.comment.id}"
