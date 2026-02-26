from django.contrib import admin
from django.utils.translation import gettext_lazy as _

from apps.admin_site import custom_admin_site
from apps.models import User, ProductVariantModel, Product, Category
from apps.models.categories import ProductImage, ProductVideo


# admin.AdminSite.login()

@admin.register(User, site=custom_admin_site)
class CustomUserAdmin(admin.ModelAdmin):
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


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'slug', 'parent']
    search_fields = ['name']
    list_filter = ['parent']


class ProductVariantInline(admin.TabularInline):
    model = ProductVariantModel
    extra = 1
    fields = ['main_image_tag', 'main_image', 'price', 'stock', 'attributes_cache']



class ProductImageStackedInline(admin.StackedInline):
    model = ProductImage
    min_num = 1

class ProductVideoStackedInline(admin.StackedInline):
    model = ProductVideo
    min_num = 1
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'name_uz', 'category', 'brand', 'created_at']
    list_filter = ['category', 'brand', 'created_at']
    search_fields = ['name_uz', 'slug']
    prepopulated_fields = {'slug': ('name_uz',)}

    inlines = [ProductVariantInline,ProductImageStackedInline,ProductVideoStackedInline]