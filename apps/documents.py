# # products/documents.py
# from django_elasticsearch_dsl import Document, Index
# from django_elasticsearch_dsl.registries import registry
#
# from apps.models.products import ProductItem
#
# products_index = Index('products')
#
# products_index.settings(
#     number_of_shards=1,
#     number_of_replicas=0
# )
#
#
# @registry.register_document
# class ProductDocument(Document):
#     class Django:
#         model = ProductItem
#         fields = [
#             'name',
#             'description',
#             'price',
#         ]
