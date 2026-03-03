from django.db.models import Model, OneToOneField, CASCADE, ForeignKey, SET_NULL, SmallIntegerField

from apps.models.base import CreatedBaseModel


class Cart(Model):
    user = OneToOneField('apps.User', CASCADE, related_name='cart')


class CartItem(CreatedBaseModel):
    product = ForeignKey('apps.Product', on_delete=SET_NULL, null=True)
    quantity = SmallIntegerField(default=1)
    cart = ForeignKey('apps.Cart', CASCADE, related_name='cart_items')
