from django.db.models import Model, ForeignKey, CASCADE
from django.db.models.fields import CharField


class Category(Model):
    name = CharField(max_length=255, unique=True)
    parent = ForeignKey('self', CASCADE, null=True, blank=True, related_name='topics')
