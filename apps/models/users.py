from django.contrib.auth.models import AbstractUser
from django.db.models import CharField, TextChoices, DateField, BooleanField, IntegerChoices, EmailField
from django.db.models import Model, ForeignKey, CASCADE
from django_ckeditor_5.fields import CKEditor5Field

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

    email = EmailField(unique=True, null=True, blank=True, )
    phone = CharField(max_length=12, validators=[uz_phone_validator], unique=True)
    patronymic = CharField(max_length=30, null=True, blank=True)
    type = CharField(max_length=12, choices=TypeChoice.choices, default=TypeChoice.USER)
    gender = BooleanField(null=True, blank=True, choices=Gender.choices, help_text=('True Male False Female'))
    birth_date = DateField(null=True, blank=True)
    username = None
    USERNAME_FIELD = "phone"
    objects = CustomUserManager()


class QuestionCategory(Model):
    question = CharField(max_length=255)

    def __str__(self):
        return f"{self.question}"


class Answer(Model):
    question_category = ForeignKey('apps.QuestionCategory', CASCADE, related_name='answers')
    question = CKEditor5Field(max_length=255)
    answer = CKEditor5Field()

    def __str__(self):
        return f"{self.question}"
