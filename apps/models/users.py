from django.contrib.auth.models import AbstractUser
from django.db.models import CharField, TextChoices, DateField, BooleanField, IntegerChoices

from apps.managers import CustomUserManager
from apps.models.utils import uz_phone_validator


class User(AbstractUser):
    class TypeChoice(TextChoices):
        ADMIN = 'admin', 'Admin'
        USER = 'user', 'User'
        SELLER = 'seller', 'Seller'
        MANAGER = 'manager', 'Manager'

    class Gender(IntegerChoices):
        MALE = 1, 'Male'
        FEMALE = 0, 'Female'

    phone = CharField(max_length=12, validators=[uz_phone_validator], unique=True)
    type = CharField(max_length=12, choices=TypeChoice.choices, default=TypeChoice.USER)
    gander = BooleanField(default=None, help_text=('True Male False Female'))
    birth_date = DateField(null=True, blank=True)
    username = None
    USERNAME_FIELD = "phone"
    objects = CustomUserManager()
