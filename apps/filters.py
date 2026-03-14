from django_filters import CharFilter, BooleanFilter
from django_filters.rest_framework import FilterSet


class CommentFilterModel(FilterSet):
    is_image = BooleanFilter(method='is_image_filter')

    def is_image_filter(self, queryset, field_name, value):
        return queryset.filter(images__isnull=value)


class ProductFiterSet(FilterSet):
    slug = CharFilter(method='slug_filter')

    def slug_filter(self, queryset, field_name, value):
        if "-" in value:
            category_id = int(value.split('-')[-1])
            return queryset.filter(category__path__contains=[category_id])
        elif '-' not in value and value.isdigit():
            return queryset.filter(category__path__contains=[int(value)])
        return queryset.none()
