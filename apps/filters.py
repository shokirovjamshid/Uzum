from django_filters import CharFilter
from django_filters.rest_framework import FilterSet

from apps.models import Comment


class CommentFilterModel(FilterSet):
    product_slug = CharFilter(method='product_slug_filter')

    def product_slug_filter(self, queryset, field_name, value):
        return queryset.filter(product__slug=value, status=Comment.Status.PUBLISHED)


class ProductFiterSet(FilterSet):
    slug = CharFilter(method='slug_filter')

    def slug_filter(self, queryset, field_name, value):
        if "-" in value:
            category_id = int(value.split('-')[-1])
            return queryset.filter(category__path__contains=[category_id])
        elif '-' not in value and value.isdigit():
            return queryset.filter(category__path__contains=[int(value)])
        return queryset.none()
