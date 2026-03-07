from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import UserManager
from django.db.models import Manager


class CustomUserManager(UserManager):
    use_in_migrations = True

    def _create_user_object(self, phone, email, password, **extra_fields):
        if not phone:
            raise ValueError("The given phone must be set")
        email = self.normalize_email(email)
        user = self.model(phone=phone, email=email, **extra_fields)
        user.password = make_password(password)
        return user

    def _create_user(self, phone, email, password, **extra_fields):
        user = self._create_user_object(phone, email, password, **extra_fields)
        user.save(using=self._db)
        return user

    def create_user(self, phone, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        extra_fields.setdefault("type", 'user')
        return self._create_user(phone, email, password, **extra_fields)

    def create_superuser(self, phone, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("type", 'admin')
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(phone, email, password, **extra_fields)


class SellerCustomManager(Manager):

    def get_queryset(self):
        query = super().get_queryset()
        return query.filter(type='seller')

    def create_seller(self, phone, email, password, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        extra_fields.setdefault("type", 'seller')
        seller = self.model(phone=phone, email=email, password=password, **extra_fields)
        seller.password = make_password(password)
        seller.save()
        return seller


class AdminCustomManager(Manager):
    def get_queryset(self):
        query = super().get_queryset()
        return query.filter(type='admin')

    def create_admin(self, phone, email, password, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        extra_fields.setdefault("type", 'admin')
        admin = self.model(phone=phone, email=email, password=password, **extra_fields)
        admin.password = make_password(password)
        admin.save()
        return admin
