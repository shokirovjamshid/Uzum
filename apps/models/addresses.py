from django.db.models import Model, CharField, ForeignKey, SET_NULL, BooleanField, IntegerField, \
    IntegerChoices, TimeField, DecimalField


class City(Model):
    name = CharField(max_length=255)

    def __str__(self):
        return self.name


class Address(Model):
    city = ForeignKey('apps.City', SET_NULL, related_name='cities')
    street = CharField(max_length=255)
    is_wearing_room = BooleanField(default=False)
    # working_hours = JSONField(default=dict, blank=True)
    deadline_time = IntegerField(default=0)
    longitude = DecimalField(max_digits=9, decimal_places=6)
    latitude = DecimalField(max_digits=9, decimal_places=6)

    def __str__(self):
        return f"{self.city},{self.street}"


class WorkingHours(Model):
    class Days(IntegerChoices):
        MONDAY = 1, 'Dushanba'
        TUESDAY = 2, 'Seyshanba'
        WEDNESDAY = 3, 'Chorshanba'
        THURSDAY = 4, 'Payshanba'
        FRIDAY = 5, 'Juma'
        SATURDAY = 6, 'shanba'
        SUNDAY = 7, 'Yakshanba'

    address = ForeignKey('apps.Address', related_name='addresses')
    days = IntegerField(choices=Days.choices, default=Days.MONDAY)
    open_time = TimeField()
    close_time = TimeField()

    def __str__(self):
        return f"{self.days},{self.open_time},{self.close_time}"
