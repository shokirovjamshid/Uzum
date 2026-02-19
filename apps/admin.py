from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from apps.models import City, DaysWeek, User


# Register your models here.

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    ordering = ['phone']

@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    pass

@admin.register(DaysWeek)
class DaysWeekAdmin(admin.ModelAdmin):
    pass

    