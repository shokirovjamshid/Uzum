from django.db.models import Model, CharField, ForeignKey, CASCADE


class ProductModel(Model):
    name = CharField(max_length=50)


class Brand(Model):
    title = CharField(max_length=100)


class Country(Model):
    name = CharField(max_length=50)


class FeatureValue(Model):
    title = CharField(max_length=50)
    value = CharField(max_length=50)


class ProductFeature(Model):
    product = ForeignKey('apps.Product', CASCADE, related_name='new_features')
    feature = ForeignKey('apps.Feature', CASCADE, related_name='product_features')


class Feature(Model):
    title = CharField(max_length=100)
    type = CharField(max_length=50)


class FeatureItem(Model):
    feature = ForeignKey('apps.Feature', CASCADE, related_name='feature_items')
    feature_value = ForeignKey('apps.FeatureValue', CASCADE)
