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
        """
        Create and save a user with the given phone, email, and password.
        """
        user = self._create_user_object(phone, email, password, **extra_fields)
        user.save(using=self._db)
        return user

    def create_user(self, phone, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(phone, email, password, **extra_fields)

    def create_superuser(self, phone, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(phone, email, password, **extra_fields)


class SellerCustomManager(Manager):
    def get_queryset(self):
        return super().get_queryset().filter(type="seller")

    def create_seller(self, phone, email, password, **extra_fields):
        extra_fields.setdefault("type", "seller")
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self.model.objects.create_user(
            phone=phone,
            email=email,
            password=password,
            **extra_fields
        )


class AdminCustomManager(Manager):
    def get_queryset(self):
        return super().get_queryset().filter(type="admin")

    def create_admin(self, phone, email, password, **extra_fields):
        extra_fields.setdefault("type", "admin")
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self.model.objects.create_user(
            phone=phone,
            email=email,
            password=password,
            **extra_fields
        )


class ManagerCustomManager(Manager):
    def get_queryset(self):
        return super().get_queryset().filter(type="manager")

    def create_manager(self, phone, email=None, **extra_fields):
        extra_fields.setdefault("type", "manager")
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self.model.objects.create_user(
            phone=phone,
            email=email,
            **extra_fields
        )
