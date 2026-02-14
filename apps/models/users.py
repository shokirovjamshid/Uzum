from django.contrib.auth.models import AbstractUser
from django.db.models import CharField, TextChoices, DateField

from apps.managers import CustomUserManager
from apps.models.utils import uz_phone_validator


class User(AbstractUser):
    class GanderChoice(TextChoices):
        MALE = 'male','Male'
        FEMALE = 'female','Female'
    class TypeChoice(TextChoices):
        ADMIN = 'admin', 'Admin'
        USER = 'user', 'User'
        SELLER = 'seller', 'Seller'
        MANAGER = 'manager', 'Manager'
    phone = CharField(max_length=12,validators=[uz_phone_validator],unique=True)
    type = CharField(max_length=12,choices=TypeChoice.choices,default=TypeChoice.USER)
    gander = CharField(max_length=6,choices=GanderChoice.choices,default=GanderChoice.FEMALE)
    birth_date = DateField(null=True,blank=True)
    username = None
    USERNAME_FIELD = "phone"
    objects = CustomUserManager()

