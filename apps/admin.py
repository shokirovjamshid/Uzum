from django.contrib import admin
from django.contrib.admin.options import InlineModelAdmin
from django.utils.translation import gettext_lazy as _
from unfold.admin import ModelAdmin

from apps.forms import CustomUserChangeForm, CustomUserCreationForm
from apps.models import City, DaysWeek, User, Category, Shop, Seller, ProductModel
from apps.models.products import Attribute, AttributeValue, ProductModelValue


@admin.register(User)
class CustomUserAdmin(ModelAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    list_display = ("phone", "first_name", "last_name", "is_staff")
    list_filter = ("is_staff", "is_superuser", "is_active", "groups")
    search_fields = ("first_name", "last_name", "phone")
    ordering = ("phone",)
    fieldsets = (
        (None, {"fields": ("phone", "email")}),
        (_("Personal info"), {"fields": ("first_name", "last_name", "type")}),
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


@admin.register(City)
class CityAdmin(ModelAdmin):
    pass


@admin.register(DaysWeek)
class DaysWeekAdmin(ModelAdmin):
    pass


@admin.register(Shop)
class ShopAdmin(ModelAdmin):
    search_fields = 'name',

    # def has_delete_permission(self, request, obj=...):
    #     return super().has_delete_permission(request, obj)
    #
    # def has_change_permission(self, request, obj=...):
    #     return super().has_change_permission(request, obj)
    #
    # def has_add_permission(self, request):
    #     return super().has_add_permission(request)


@admin.register(Seller)
class SellerAdmin(ModelAdmin):
    search_fields = 'name',


class ModelCategoryValueInline(admin.StackedInline):
    model = ProductModelValue


# class ModelCategoryModelInline(InlineModelAdmin):
#     model = ProductModel
#     inlines = (ModelCategoryValueInline,)


@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display = ('name',)
    search_fields = 'name',
    # inlines = (ModelCategoryModelInline,)


class AttributeValueInline(admin.StackedInline):
    model = AttributeValue


@admin.register(Attribute)
class AttributeAdmin(admin.ModelAdmin):
    inlines = AttributeValueInline,

# @admin.register()
# class Admin(admin.ModelAdmin):
