from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from apps.models import City, DaysWeek, User


# Register your models here.
# @admin.register(City)
# class CityAdmin(admin.ModelAdmin):
#     pass

#
# class WorkingHoursInline(admin.StackedInline):
#     model = WorkingHours
#     extra = 0
#     min_num = 1
#     max_num = 7
#     verbose_name_plural = 'Working Hours'
#
#
# @admin.register(Address)
# class AddressAdmin(admin.ModelAdmin):
#     inlines = [WorkingHoursInline]
#     list_display = ('id', 'city', 'street')
#     list_filter = ('id', 'city', 'street')
#
#
# class AnswerInline(admin.StackedInline):
#     model = Answer
#     min_num = 1
#     extra = 0
#     verbose_name_plural = 'Answers'
#
#
# @admin.register(QuestionCategory)
# class QuestionCategoryAdmin(admin.ModelAdmin):
#     inlines = [AnswerInline]
#     fields = 'id', 'question'


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    ordering = ['phone']


@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    pass


@admin.register(DaysWeek)
class DaysWeekAdmin(admin.ModelAdmin):
    pass
