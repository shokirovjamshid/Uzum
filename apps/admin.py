from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from unfold.admin import ModelAdmin, StackedInline

from apps.models import City, DaysWeek, User, Weekday, WeekdaysInfo, DeliveryPoint


@admin.register(User)
class CustomUserAdmin(ModelAdmin):
    list_display = ("phone", "first_name", "last_name", "is_staff")
    list_filter = ("is_staff", "is_superuser", "is_active", "groups")
    search_fields = ("first_name", "last_name", "phone")
    ordering = ("phone",)
    fieldsets = (
        (None, {"fields": ("phone",)}),
        (_("Personal info"), {"fields": ("first_name", "last_name")}),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("phone", "usable_password", "password1", "password2"),
            },
        ),
    )


@admin.register(City)
class CityAdmin(ModelAdmin):
    pass

@admin.register(DaysWeek)
class DaysWeekAdmin(ModelAdmin):
    pass
