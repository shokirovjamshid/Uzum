from django.contrib.auth.models import AbstractUser
from django.db.models import ForeignKey, CASCADE, SET_NULL, Model, BigIntegerField
from django.db.models import IntegerChoices, ImageField, IntegerField, EmailField, OneToOneField
from django.db.models.enums import TextChoices
from django.db.models.fields import DateField
from django.db.models.fields import FloatField, PositiveIntegerField, TextField
from django.db.models.fields import PositiveSmallIntegerField, CharField, BooleanField
from location_field.forms.plain import PlainLocationField

from apps.managers import CustomUserManager, SellerCustomManager, ManagerCustomManager, AdminCustomManager
from apps.models.base import CreatedBaseModel
from apps.models.base import ImageBaseModel
from apps.models.base import SlugBaseModel
from apps.models.utils import uz_phone_validator


class User(AbstractUser, ImageBaseModel):
    class TypeChoice(TextChoices):
        ADMIN = 'admin', 'Admin'
        USER = 'user', 'User'
        SELLER = 'seller', 'Seller'
        MANAGER = 'manager', 'Manager'

    class Gender(IntegerChoices):
        MALE = 1, 'Male'
        FEMALE = 0, 'Female'

    addition_phone = CharField(max_length=12, validators=[uz_phone_validator])
    email = EmailField(unique=True, null=True, blank=True)
    phone = CharField(max_length=12, validators=[uz_phone_validator], unique=True)
    password = CharField(max_length=128, null=True, blank=True)
    is_online = BooleanField(default=False)
    patronymic = CharField(max_length=30, null=True, blank=True)
    type = CharField(max_length=12, choices=TypeChoice.choices, default=TypeChoice.USER)
    gender = IntegerField(null=True, blank=True, choices=Gender.choices, help_text='True Male False Female')
    birth_date = DateField(null=True, blank=True)
    username = None
    USERNAME_FIELD = "phone"
    objects = CustomUserManager()
    sellers = SellerCustomManager()
    managers = ManagerCustomManager()
    admins = AdminCustomManager()

    @property
    def is_admin(self):
        return self.type == self.TypeChoice.ADMIN or self.is_superuser


class Seller(CreatedBaseModel):
    user = OneToOneField('apps.User', CASCADE, related_name='seller')


class Shop(CreatedBaseModel, ImageBaseModel, SlugBaseModel):
    name = CharField(max_length=125)
    seller = ForeignKey('apps.Seller', CASCADE, related_name='shops')
    description = TextField(null=True, blank=True)
    banner = ImageField(upload_to='seller/banner/%Y/%m/%d', null=True, blank=True)
    rating = FloatField(default=0)
    comment_count = PositiveIntegerField(default=0)
    order_count = PositiveIntegerField(default=0)


class Order(CreatedBaseModel):
    class DeliveryType(TextChoices):
        DELIVERY_POINT = 'delivery_point', 'Delivery point'
        DELIVERY = 'delivery', 'Delivery'

    class Status(TextChoices):
        PENDING = 'pending', 'Pending'
        PAID = 'paid', 'Paid'
        CANCELED = 'canceled', 'Canceled'

    user = ForeignKey('apps.User', CASCADE, related_name='orders')
    delivery_point = ForeignKey('apps.DeliveryPoint', SET_NULL, null=True)
    payment_type = ForeignKey('apps.PaymentType', SET_NULL, null=True)
    customer_recipient = ForeignKey('apps.CustomerRecipient', SET_NULL, null=True)
    delivery_location = PlainLocationField(based_fields=['address'], zoom=9)
    status = CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    # promo_code =


class OrderItem(Model):
    order = ForeignKey('apps.Order', CASCADE, related_name='order_items')
    product = ForeignKey('apps.ProductItem', SET_NULL, null=True)
    is_comment = BooleanField(default=False)
    quantity = PositiveSmallIntegerField()
    price = BigIntegerField()


class PaymentType(Model):
    class StateType(TextChoices):
        ACTIVE = 'active', 'Active'
        DISABLED = 'disabled', 'Disabled'

    title = CharField(max_length=255)
    active = BooleanField()
    state = CharField(choices=StateType.choices)
    description = CharField(max_length=255, null=True, blank=True)
    block_description = CharField(max_length=255, null=True, blank=True)


class CustomerRecipient(Model):
    name = CharField(max_length=255)
    surname = CharField(max_length=255)
    is_default = BooleanField()
    phone = CharField(max_length=50, validators=[uz_phone_validator])
