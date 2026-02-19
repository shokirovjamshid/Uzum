from django.db.models import Model, CharField, ForeignKey, CASCADE, TimeField, BooleanField, TextField, \
    SmallIntegerField
from django.db.models.enums import TextChoices
from location_field.models.plain import PlainLocationField


class DeliveryPointsComment(Model):
    class CommentTypes(TextChoices):
        DESCRIPTION = 'description', 'Description'
        WARNING = 'warning', 'Warning'
        INFO = 'info', 'Information'

    delivery_point = ForeignKey('apps.DeliveryPoint', on_delete=CASCADE, related_name='comments')
    type = CharField(max_length=30, choices=CommentTypes.choices)
    text = TextField()


class DeliveryPoint(Model):
    class PaidAvailabilityChoices(TextChoices):
        CARD = 'cart', 'Card'
        CASH_AND_CARD = 'cash_and_card', 'Cash and card'
        CASH = 'cash', 'Cash'

    class TypeChoices(TextChoices):
        DELIVERY_POINT = 'DELIVERY_POINT', 'Delivery Point'
        UZ_POST = 'UZ_POST', "O'zbekiston pochta"

    address = CharField(max_length=255)
    city = ForeignKey('apps.City', on_delete=CASCADE, related_name='delivery_points')
    location = PlainLocationField(based_fields=['address'], zoom=9)
    time_from = TimeField()
    time_to = TimeField()
    has_dressing_room = BooleanField()
    post_paid_availability = CharField(choices=PaidAvailabilityChoices.choices, default=PaidAvailabilityChoices.CASH)
    type = CharField(max_length=40, choices=TypeChoices.choices, default=TypeChoices.DELIVERY_POINT)
    title = CharField(max_length=255)
    order_retention_period = SmallIntegerField()


class DaysWeek(Model):
    name = CharField(max_length=50)


class Weekday(Model):
    delivery_point = ForeignKey('apps.DeliveryPoint', CASCADE, related_name='weekdays')
    day = ForeignKey('apps.DaysWeek', on_delete=CASCADE, related_name='weekdays')
    day_off = BooleanField(default=False)
    working_hours = CharField(max_length=255, null=True, blank=True)


class WeekdaysInfo(Model):
    delivery_point = ForeignKey('apps.DeliveryPoint', CASCADE, related_name='weekdaysInfo')
    day_range = CharField(max_length=100)
    day_off = BooleanField(default=False)
    working_hours = CharField(max_length=255)
