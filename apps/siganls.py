# from django.db.models.signals import post_save, post_delete
# from django.dispatch import receiver
#
#
# @receiver(post_save, sender=P)
# def sync_to_search_engine(sender, instance, **kwargs):
#
#     ProductDocument().update(instance.product)
#     print(f"ES Sync: Product {instance.product.id} yangilandi.")
# @receiver(post_delete, sender=ProductVariantModel)
# def delete_from_search_engine(sender, instance, **kwargs):
#     ProductDocument().update(instance.product)