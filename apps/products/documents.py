from django_elasticsearch_dsl import Document, TextField, KeywordField, CompletionField, NestedField, LongField, \
    DoubleField, IntegerField, ObjectField
from django_elasticsearch_dsl.registries import registry

from models import Product, ProductVariant


@registry.register_document
class ProductDocument(Document):
    name_uz = TextField(
        attr='name_uz',
        fields={
            'raw': KeywordField(),
            'suggest': CompletionField(),
        }
    )

    variants = NestedField(properties={
        'sku_id': LongField(),
        'price': DoubleField(),
        'stock': IntegerField(),
        'attributes_cache': ObjectField(),
        'variant_slug': KeywordField(),
    })

    class Index:
        name = 'products'
        settings = {'number_of_shards': 3, 'number_of_replicas': 1}

    class Django:
        model = Product
        related_models = [ProductVariant]

    def get_instances_from_related(self, related_instance):
        if isinstance(related_instance, ProductVariant):
            return related_instance.product
